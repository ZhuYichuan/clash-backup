运行过clash，~/.config/clash下会自动生成
config.yaml
Country.mmdb
将这两个文件拷到目前配置目录，比如/etc/clash。

`sudo ln -s ~/.config/clash /etc/clash`

> clash -> linux 可执行文件
clash 文件移动到 `/usr/local/bin/clash`

> clash-dashboard-master.zip -> 页面控制面板

> 解压
`tar -xvf clash-dashboard-master.zip -C clash-dashboard`
> 
> 打包成.tar文件
`tar -cvf [文件名].tar [文件目录]`
> 
>config.yaml 加
```
`mixed-port: 7890`
allow-lan: true
mode: Rule
log-level: info
`external-ui: dashboard`
`external-controller: 0.0.0.0:9090`
```
访问控制台 `http://xxx:port/ui/dist`

创建 `/etc/systemd/system/clash.service`
```
[Unit]
Description=Clash Daemon

[Service]
ExecStart=/usr/local/bin/clash -d ~/.config/clash
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

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
