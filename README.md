此程序是linux客户端,GUI使用mihomo-dashboard
---


# linux
`mihomo` -> linux 可执行文件

`mihomo`文件移动到 `/usr/local/bin/mihomo`

运行过mihomo，~/.config/mihomo下会自动生成config.yaml

执行 `sudo ln -s ~/.config/mihomo /etc/mihomo`

config.yaml 加配置

创建 `/etc/systemd/system/mihomo.service`
```
[Unit]
Description=Mihomo Daemon

[Service]
ExecStart=/usr/local/bin/mihomo -d /home/xxx/.config/mihomo
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
```
执行 `sudo systemctl daemon-reload`

启动服务：`sudo systemctl start mihomo.service`

相关命令：
```
systemctl enable mihomo
systemctl start mihomo
systemctl stop mihomo
systemctl status mihomo
journalctl -xe
service mihomo start 
service mihomo stop 
service mihomo restart
service mihomo status 
```

查看日志：
```
journalctl -e -u mihomo.service
```

# Windows

你可以通过以下步骤在 Windows 中创建服务实现后台运行：

### 使用 NSSM（推荐更稳定）
1. [下载 NSSM](https://nssm.cc/download)
2. 解压后将 `nssm.exe` 放到 `C:\Windows\System32`
3. 管理员权限运行命令提示符：
```cmd
nssm install mihomo.service
```
4. 在弹出的 GUI 中设置：
   - Path: `C:\Windows\System32\mihomo.exe`
   - Arguments: `-f "C:\Users\zhuyi\.config\mihomo\config.yaml"`
   - 在 "Details" 选项卡设置服务名称
   - 在 "Log on" 选项卡选择 "Local System account"

5. 启动服务：
```cmd
nssm start mihomo.service
```

### 验证服务状态
```cmd
sc query mihomo.service
```

### 删除服务
```cmd
sc delete mihomo.service
# 或使用 NSSM
nssm remove mihomo.service confirm
```

建议优先使用 NSSM 工具，它可以：
- 自动处理服务生命周期
- 捕获输出日志
- 支持服务崩溃后自动重启
- 提供友好的 GUI 配置界面

如果遇到权限问题，请确保全程使用管理员权限操作。服务创建后会自动随系统启动，即使没有用户登录也会在后台运行。

# macOS
brew install mihomo

```
sudo tee /Library/LaunchDaemons/com.mihomo.daemon.plist > /dev/null << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mihomo.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/mihomo</string>
        <string>-d</string>
        <string>/Users/xxx/.config/mihomo</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/var/log/mihomo.err</string>
    <key>StandardOutPath</key>
    <string>/var/log/mihomo.out</string>
</dict>
</plist>
EOF
```
`sudo launchctl load /Library/LaunchDaemons/com.mihomo.daemon.plist`
`sudo launchctl unload /Library/LaunchDaemons/com.mihomo.daemon.plist`
