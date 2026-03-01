#  开启系统双栈 IP 转发
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
```
3.应用生效：
```
sudo sysctl --system
```
# 创建Mihomo 并配置 Mihomo
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

# 第三步：配置策略路由 (配合 Systemd 持久化)
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
