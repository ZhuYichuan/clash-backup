# 第一步: 开启系统双栈 IP 转发
1. 编辑系统参数：
```Bash
sudo vi /etc/sysctl.d/99-gateway.conf
```
2.填入以下内容：
```
net.ipv4.ip_forward=1
net.ipv6.conf.all.forwarding=1
# 优化网络拥塞控制（推荐）
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr

dns:
  enable: true
  listen: 0.0.0.0:53
```
3.应用生效：
```
sudo sysctl --system
```
# 每二步: 创建Mihomo 并配置 Mihomo
1.创建文件 /etc/systemd/system/mihomo.service
```
 /etc/systemd/system/mihomo.service                                                                                                                                                                                                      [11:01:54]
[Unit]
Description=Mihomo Daemon

[Service]
ExecStart=/usr/local/bin/mihomo -d /home/zhuyichuan/.config/mihomo
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
```

2.mihomo yaml 
```
tproxy-port: 7893
allow-lan: true
bind-address: '*'
ipv6: true
# 强烈建议开启 sniff，这对透明代理处理域名极度重要
sniffer:
  enable: true
  parse-pure-ip: true
  sniff:
    tls:
      ports: [443, 8443]
    http:
      ports: [80, 8080-8880]
```

# 第三步: 配置策略路由 (配合 Systemd 持久化)
1.创建路由脚本
```
sudo vi /usr/local/bin/tproxy-route.sh
```
2.填入以下双栈路由命令
```
#!/bin/bash
# IPv4 策略路由
ip rule add fwmark 1 table 100
ip route add local default dev lo table 100

# IPv6 策略路由
ip -6 rule add fwmark 1 table 100
ip -6 route add local default dev lo table 100
```
3.赋予执行权限
```
sudo chmod +x /usr/local/bin/tproxy-route.sh
```
4.创建 Systemd 服务来实现开机自动应用：
```
[Unit]
Description=TPROXY Policy Routing
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/tproxy-route.sh
RemainAfterExit=yes
User=root

[Install]
WantedBy=multi-user.target
```
5.启动并设置开机自启
```
sudo systemctl enable --now tproxy-route.service
```

# 第四步: 编写并持久化 nftables 规则
1. 安装 nftables（如果尚未安装）：
```
sudo apt update
sudo apt install nftables
```
3. 备份并替换默认的 nftables.conf：
```
sudo mv /etc/nftables.conf /etc/nftables.conf.bak
sudo vi /etc/nftables.conf
```
4. 将以下完整规则填入。这套规则利用 inet 表同时搞定 IPv4 和 IPv6，并且过滤了所有内网/保留地址：
```
#!/usr/sbin/nft -f

flush ruleset

table inet proxy {
    # 定义 IPv4 保留地址集合 (不进入代理)
    set reserved_ipv4 {
        type ipv4_addr
        flags interval
        elements = {
            0.0.0.0/8, 10.0.0.0/8, 127.0.0.0/8,
            169.254.0.0/16, 172.16.0.0/12, 192.168.0.0/16,
            224.0.0.0/4, 240.0.0.0/4
        }
    }

    # 定义 IPv6 保留地址集合 (不进入代理)
    set reserved_ipv6 {
        type ipv6_addr
        flags interval
        elements = {
            ::/128, ::1/128, ::ffff:0:0/96,
            fc00::/7, fe80::/10, ff00::/8
        }
    }

    # 1. 局域网设备流量处理 (PREROUTING)
    chain prerouting {
        type filter hook prerouting priority mangle; policy accept;

        # 目标是保留地址的直接放行
        ip daddr @reserved_ipv4 return
        ip6 daddr @reserved_ipv6 return

        # 【修正】：明确拆分 TCP 和 UDP
        meta l4proto tcp tproxy to :7893 meta mark set 1 accept
        meta l4proto udp tproxy to :7893 meta mark set 1 accept
    }

    # 2. Ubuntu 本机流量处理 (OUTPUT)
    chain output {
        type route hook output priority mangle; policy accept;

        # 【核心防环路】放行 mihomo 用户发出的流量
        meta skuid "root" return

        # 目标是保留地址的直接放行
        ip daddr @reserved_ipv4 return
        ip6 daddr @reserved_ipv6 return

        # 【修正】：同样明确拆分 TCP 和 UDP
        meta l4proto tcp meta mark set 1 accept
        meta l4proto udp meta mark set 1 accept
    }
}
```
4. 应用并设置 nftables 开机自启：
```
sudo systemctl enable --now nftables
sudo nft -f /etc/nftables.conf
```
# 测试
`curl -I https://www.google.com`
`curl -I -6 https://www.google.com`   


# 附
```
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```
```
sudo vi /etc/resolv.conf

# 首选让本机查询本地的 Mihomo (稍后配置 Mihomo 监听 53 端口)
nameserver 127.0.0.1

```
`sudo ss -tulpn | grep :53`

