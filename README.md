此程序是linux客户端,GUI使用clash-dashboard
---



`clash` -> linux 可执行文件

`clash`文件移动到 `/usr/local/bin/clash`

运行过clash，~/.config/clash下会自动生成config.yaml ,Country.mmdb

执行 `sudo ln -s ~/.config/clash /etc/clash`

---
`clash-dashboard-master.zip` -> 页面控制面板 提供给你编编译使用

我已经编译好dist文件在 dashboard 中
移动目录`dashboard` 到 ` ~/.config/clash`下

打包成.tar文件 `tar -cvf [文件名].tar [文件目录]`

---

config.yaml 加配置
```
`mixed-port: 7890`
allow-lan: true
mode: Rule
log-level: info
`external-ui: dashboard`
`external-controller: 0.0.0.0:9090`
```
访问控制台 `http://xxx:port/ui/dist`  密码 `123456`

创建 `/etc/systemd/system/clash.service`
```
[Unit]
Description=Clash Daemon

[Service]
ExecStart=/usr/local/bin/clash -d /home/xxx/.config/clash
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
```
执行 `sudo systemctl daemon-reload`

启动服务：`sudo systemctl start clash.service`

相关命令：
```
systemctl enable clash
systemctl start clash
systemctl stop clash
systemctl status clash
journalctl -xe
service clash start 
service clash stop 
service clash restart
service clash status 
```

查看日志：
```
journalctl -e -u clash.service
```



# 要使 Windows 机器（192.168.9.10）通过 Ubuntu 上运行的 Clash（开启了 TUN 模式）来科学上网，你需要做以下几步配置：

1. 配置 Ubuntu 上的 Clash
确保你的 Clash 配置正确，且已经启用了 TUN 模式。TUN 模式使得 Clash 能够通过虚拟网络接口将流量路由到指定的代理服务器。

在你的 Ubuntu 上，Clash 应该会创建一个虚拟的 TUN 接口（比如 tun0），并在这个接口上进行流量转发。通常，Clash 配置文件会有类似如下的内容：

yaml
复制代码
tun:
  enable: true
  dev: tun0
  stack: system
  dns-hijack:
    - 0.0.0.0/0
    - ::/0
确保 dns-hijack 配置已启用，且 Clash 可以正常运行。

2. 配置 Windows 的网关
为了让 Windows 机器的流量通过 Ubuntu 机器转发，你需要将 Windows 的默认网关设置为 Ubuntu 的 IP 地址。假设你的 Ubuntu IP 是 192.168.9.2，那么：

打开 Windows 的网络设置
进入“网络和共享中心”，点击你当前连接的网络，选择“属性”。
在“Internet 协议版本 4 (TCP/IPv4)”上点击“属性”。
在“默认网关”中填写 Ubuntu 的 IP 地址：192.168.9.2。
这样，Windows 机器的流量会通过 Ubuntu 路由，进而通过 Clash 的 TUN 模式走代理。

3. 配置 Windows 的 DNS
为了确保 Windows 机器的 DNS 请求能够走 Clash，你需要将 DNS 配置为 192.168.9.1（Ubuntu 路由器地址），或者直接使用 Clash 代理内的 DNS。

有两种方式来配置 DNS：

方法 1：设置为本地路由器 DNS
继续在 Windows 的网络设置中，选择“Internet 协议版本 4 (TCP/IPv4)”属性。
在“DNS 服务器地址”中填写 192.168.9.1（你路由器的 IP 地址）。这通常会让你的 DNS 请求通过本地路由器转发。
方法 2：直接使用 Clash 提供的 DNS
如果你希望 DNS 请求通过 Clash 代理来解析，可以设置 Windows 使用 Clash 的 DNS。你需要修改 Clash 的配置文件，确保 DNS 设置是正确的，比如：

yaml
复制代码
dns:
  enable: true
  listen: 0.0.0.0:53
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
然后在 Windows 设置中，将 DNS 服务器地址设置为 Ubuntu 的 IP（192.168.9.2）。这会让 DNS 请求通过 Clash 来处理。

4. 配置 Ubuntu 路由转发
如果 Ubuntu 没有默认启用 IP 转发，你需要在 Ubuntu 上启用它，以允许流量转发：

编辑 /etc/sysctl.conf，取消注释或添加以下行：

bash
复制代码
net.ipv4.ip_forward=1
然后运行以下命令使配置生效：

bash
复制代码
sudo sysctl -p
5. 配置防火墙
确保防火墙允许通过 Clash 的流量。你可能需要在 Ubuntu 上配置一些 iptables 规则，允许来自 Windows 机器的流量通过 Clash：

bash
复制代码
sudo iptables -t nat -A POSTROUTING -o tun0 -j MASQUERADE
如果你的系统使用 ufw，可以使用如下命令来允许转发流量：

bash
复制代码
sudo ufw allow from 192.168.9.10
总结
将 Windows 的网关设置为 Ubuntu 的 IP 地址（192.168.9.2）。
将 Windows 的 DNS 设置为路由器的 IP 地址（192.168.9.1），或者直接使用 Clash 的 DNS。
确保 Ubuntu 启用了 IP 转发。
配置防火墙规则允许流量转发。
按照这些步骤，你的 Windows 机器应该可以通过 Ubuntu 上的 Clash 实现科学上网。如果还有其他问题，欢迎继续提问！






您说：
ERRO[2024-12-31T22:20:52.852839681+08:00] Start DNS server error: listen udp 0.0.0.0:53: bind: address already in use
INFO[2024-12-31T22:20:52.853041289+08:00] Mixed(http+socks) proxy listening at: [::]:7890
ERRO[2024-12-31T22:20:52.853158998+08:00] Start TUN listening error: parse dns-hijack url error: not an ip:port
ChatGPT 说：
ChatGPT
从你提供的错误日志来看，Clash 遇到了一些问题：

DNS 端口 53 已被占用：
listen udp 0.0.0.0:53: bind: address already in use 表示端口 53 已被占用。这个问题通常出现在 Clash 尝试绑定到 DNS 端口时，但这个端口已被其他应用占用。

TUN 模式启动失败：
Start TUN listening error: parse dns-hijack url error: not an ip:port 表示 Clash 的配置文件中的 dns-hijack 配置出现了错误，可能是格式问题。

解决方案
1. DNS 端口被占用问题
端口 53 是一个标准的 DNS 服务端口，如果系统中已有其他 DNS 服务占用了这个端口（例如，系统的 DNS 服务或者其他应用程序），Clash 就无法绑定到该端口。

查看哪个进程占用了 53 端口： 可以使用以下命令查看是哪个进程占用了 53 端口：

bash
复制代码
sudo lsof -i :53
或者：

bash
复制代码
sudo netstat -tuln | grep :53
如果是其他程序占用了这个端口，你可以选择关闭该程序，或者修改 Clash 的 DNS 端口。

修改 Clash 的 DNS 端口： 如果不希望关闭其他 DNS 服务，可以通过修改 Clash 配置文件中的 DNS 端口来避免冲突。打开 Clash 配置文件 (config.yaml)，并更改 DNS 监听端口，例如：

yaml
复制代码
dns:
  enable: true
  listen: 0.0.0.0:5353  # 更改为 5353 或其他未被占用的端口
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
修改后保存并重启 Clash。

2. TUN 模式的 DNS Hijack 配置问题
错误 parse dns-hijack url error: not an ip:port 表示你的配置文件中的 dns-hijack 配置格式错误，通常是因为缺少有效的 ip:port 配置。

检查 dns-hijack 配置： 你应该确保在 dns-hijack 配置项中使用正确的 ip:port 格式。正常情况下，dns-hijack 用于将 DNS 请求劫持并通过代理发送。例如：

yaml
复制代码
dns-hijack:
  - 0.0.0.0/0
  - ::/0
如果你在配置中添加了 dns-hijack 的 IP 地址和端口，确保格式正确，且不包含空格或其他错误。dns-hijack 应该是一个 IP 地址段或域名，或者空地址。

如果你不需要对 DNS 请求进行劫持，尝试暂时删除或注释掉 dns-hijack 配置部分：

yaml
复制代码
# dns-hijack:
#   - 0.0.0.0/0
#   - ::/0
这样可以排除这个配置项对 TUN 模式的影响。

3. 检查 TUN 模式配置
如果仍然遇到问题，检查 Clash 配置文件中的 tun 部分。确保 dev 字段指向一个有效的虚拟网络接口（例如 tun0）。通常，TUN 模式的配置如下：

yaml
复制代码
tun:
  enable: true
  dev: tun0  # 确保该接口存在并配置正确
  stack: system
确保 tun0 接口存在并且是活动状态。你可以通过运行 ip a 或 ifconfig 来检查是否有此接口。

总结
端口冲突：检查端口 53 是否被占用，或者修改 Clash 的 DNS 端口。
配置问题：检查 dns-hijack 配置项格式是否正确，或者尝试暂时禁用此配置。
TUN 配置：确保 TUN 模式的配置正确，并且接口存在。
修改配置后，重启 Clash 并检查是否还出现错误。希望这些步骤能帮助你解决问题！






您说：
怎么把53转到5353上
ChatGPT 说：
ChatGPT
要将端口 53 的流量转发到 5353，你需要在 Ubuntu 上设置一些网络转发规则。可以通过 iptables 来实现这个端口转发。

步骤
使用 iptables 设置端口转发 你可以通过 iptables 来实现将 DNS 请求（端口 53）转发到 5353 端口。假设 Clash 配置监听 5353 端口，你可以按如下方式设置：

执行以下命令来添加端口转发规则：

bash
复制代码
sudo iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-port 5353
这个规则会把所有进入端口 53 的 UDP 流量转发到 5353 端口。

保存 iptables 规则 这些规则会在系统重启后丢失，因此你需要将它们保存下来。你可以使用 iptables-save 和 iptables-restore 来保存规则，或者使用 ufw（如果你正在使用 ufw 管理防火墙）。

如果你使用 iptables-save，执行以下命令将规则保存到文件：

bash
复制代码
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'
确保 Clash 使用 5353 端口 在 Clash 配置文件中，将 DNS 的监听端口设置为 5353。打开你的 config.yaml 文件，并确保以下部分的设置正确：

yaml
复制代码
dns:
  enable: true
  listen: 0.0.0.0:5353  # 将 DNS 监听端口设置为 5353
  default-nameserver:
    - 8.8.8.8
    - 1.1.1.1
确保 Ubuntu 启用 IP 转发 你需要确保 Ubuntu 系统允许 IP 转发，以便路由器能够正确转发流量。打开 /etc/sysctl.conf 文件，确保以下配置没有被注释掉：

bash
复制代码
net.ipv4.ip_forward=1
然后运行以下命令使其生效：

bash
复制代码
sudo sysctl -p
测试和验证 现在，你可以测试是否成功将 DNS 请求从端口 53 转发到 5353。可以使用 dig 或 nslookup 工具来测试 DNS 查询：

bash
复制代码
dig @localhost example.com
如果配置正确，Clash 应该能够通过 5353 端口处理 DNS 请求。

其他注意事项
防火墙配置：如果你启用了防火墙（如 ufw），请确保允许端口 5353 的流量通过：

bash
复制代码
sudo ufw allow 5353/udp
端口冲突：如果 53 端口已经被系统的 DNS 服务占用，可能需要停止系统的 DNS 服务。你可以停止 systemd-resolved 服务，或者禁用其使用 53 端口。

停止 systemd-resolved 服务：

bash
复制代码
sudo systemctl stop systemd-resolved
禁用它的启动：

bash
复制代码
sudo systemctl disable systemd-resolved
通过上述步骤，你应该能够成功将端口 53 的 DNS 请求转发到 Clash 的 5353 端口，并通过 Clash 的 DNS 功能处理这些请求。






您说：
重启ubuntu 怎么恢复 /etc/iptables/rules.v4
ChatGPT 说：
ChatGPT
如果你希望在 Ubuntu 重启后自动恢复 iptables 规则，你需要确保规则文件 /etc/iptables/rules.v4 被正确加载，并且 iptables 规则在系统启动时得到应用。下面是几种常见的方法来实现这一点。

1. 使用 iptables-persistent 来保存规则
iptables-persistent 是一个专门用于保存和恢复 iptables 规则的包，可以在系统重启后自动恢复规则。

安装 iptables-persistent
如果你还没有安装 iptables-persistent，可以通过以下命令来安装：

bash
复制代码
sudo apt update
sudo apt install iptables-persistent
在安装过程中，它会提示你是否保存当前的 iptables 规则。如果选择 是，系统会自动将当前规则保存到 /etc/iptables/rules.v4 和 /etc/iptables/rules.v6。

手动保存规则
如果你已经安装了 iptables-persistent，或者没有在安装时保存规则，你可以手动保存规则：

bash
复制代码
sudo iptables-save > /etc/iptables/rules.v4
sudo ip6tables-save > /etc/iptables/rules.v6
规则恢复
iptables-persistent 会自动在每次系统启动时加载这些规则。你不需要额外配置，iptables-persistent 会处理加载过程。

2. 使用 netfilter-persistent 来恢复规则
netfilter-persistent 是 iptables-persistent 的一个依赖包，用于在启动时恢复规则。一般情况下，安装 iptables-persistent 后，netfilter-persistent 会自动处理规则的加载。

你也可以手动重载规则：

bash
复制代码
sudo netfilter-persistent save
这个命令会保存当前规则并更新 /etc/iptables/rules.v4 和 /etc/iptables/rules.v6。

3. 使用 cron 来恢复规则
如果你不想安装额外的包，还可以通过创建一个简单的 cron 任务，在系统重启时自动恢复 iptables 规则。

创建 cron 任务
打开 crontab 配置文件：

bash
复制代码
sudo crontab -e
添加以下行，使得每次系统启动时自动加载 iptables 规则：

bash
复制代码
@reboot iptables-restore < /etc/iptables/rules.v4
这将会在系统重启时执行 iptables-restore 命令，将 /etc/iptables/rules.v4 文件中的规则加载到防火墙中。

4. 手动恢复规则（每次重启后）
如果你不想使用额外的工具或包，也可以手动恢复 iptables 规则。每次系统重启后，你可以手动执行以下命令：

bash
复制代码
sudo iptables-restore < /etc/iptables/rules.v4
这会根据 /etc/iptables/rules.v4 文件中的规则来恢复 iptables 配置。

总结
最推荐的方法是使用 iptables-persistent，因为它自动处理规则的保存和恢复，适合大多数场景。如果你不想使用额外的工具，也可以通过 cron 来定时加载规则。
