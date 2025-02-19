---
title: '工欲善其事，必先利其器 —— 我的家庭网络组网方案'
date: '2024-03-20'
category: '技术'
excerpt: '本文将介绍如何使用 Next.js 13+ 和 TailwindCSS 构建一个现代化的个人博客系统...'
---

> 本文仅作测试使用

> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.skk.moe](https://blog.skk.moe/post/home-network-setup/)

> 好久没写网络相关的科普文了，这次借着搬家的机会，我重新设计了一下的网络架构、给自己的公寓组网，写一篇上万字的组网碎碎念记录一下。

好久没写网络相关的科普文了，这次借着搬家的机会，我重新设计了一下的网络架构、给自己的公寓组网，写一篇上万字的组网碎碎念记录一下。

[](#内网带宽和布线 "内网带宽和布线")内网带宽和布线
-----------------------------

和不少折腾 HomeLab 做了全屋光纤，甚至全屋 10 Gbps（万兆）乃至 40 Gbps 的朋友不同，我的理念是家庭组网时，只需要 NAS 和工作站之间有 10 Gbps 或者更高的带宽就够了（例如工作站和 NAS 都处在同一 VLAN 下并且连接到同一个万兆交换机），全屋内网带宽 2.5 GbE 足矣、甚至大部分场景下 GbE 也绰绰有余了。

如果搭建家庭媒体影音娱乐、NAS 使用 H.264 编码推流，常见的 4K (2160p) 24fps 电影的码率不过 16 Mbps ~ 32 Mbps，意味着 FE（100 Mbps）带宽都足够同时承载 4 股 4K@24 的推流；即使是全蓝光插帧的 8K (4320p) 60fps 视频的码率也不过 192 Mbps ~ 256 Mbps，此时 GbE (1 Gbps) 带宽同时承载 3 股 8K@60 推流依然绰绰有余。

大部分家庭安防摄像头大多是 300 万至 500 万像素，H.264 编码后的码率不过 5 Mbps ~ 10 Mbps；即使是 800 万像素至 4K 的高端安防摄像头，码率也不过 16 Mbps ~ 32 Mbps，更何况大部分摄像头都具有简单的运动检测、人脸识别等功能，并不会全天候推流，实际内网带宽利用率只会更低，这也是为什么绝大部分 NVR 都采用 GbE uplink。

绝大部分 AP 采用的也都是 GbE uplink。UniFi 上一代 U6 系列 AP 的中高端旗舰产品 U6 Pro 也只有 PoE GbE uplink，只有支持 Wi-Fi 6E + 6 GHz 的企业级 AP U6 Enterprise 和这一代 U7 系列支持 Wi-Fi 7 + 6 Ghz 的 AP 才使用 PoE 2.5 GbE uplink。

综上，除了 NAS、HomeLab 到自己工作站之间可以考虑布 10 GbE 甚至 40 GbE，而且 NAS 如果不放在网络机柜而是直接放在书房里的话，甚至只需要在书房内用超六类明线连接 NAS 和工作站即可、甚至不需要穿线管。全铜 24AWG 的 Cat.5E 超五类网线在 40 米左右情况下可以轻松跑满万兆（10 GbE），普通铜包铝的 Cat.5E 网线在 10 米内也能轻松跑满万兆；六类线 Cat.6 在 80 米以内可以轻松跑满万兆，80 米到 125 米之间，两端网卡可以协商到 5 GbE、125 米到 175 米之间依然可以协商到 2.5 GbE。因此绝大部分家庭在装修时只需要布六类线即可，考虑到大部分家庭都没有网络跳线屏蔽条件，即使布了七类线也完全无法发挥出全部性能；全屋光纤更是毫无必要，因为光纤便宜但光电转换器、光交换机贵，而且光纤因为无法承载 PoE 反而会在部署 IoT 设备时难以为设备供电。

[](#路由器、网关 "路由器、网关")路由器、网关
--------------------------

一个网络中最重要的设备之一就是路由器。经验证明，路由器一定不能选择 OpenWrt、尤其不能将 OpenWrt 装在 All in One HomeLab 的虚拟机中，因为 OpenWrt 搭配软路由的稳定性是远远不如硬路由的，而 All in One 就是 All in Boom，一旦网络出现问题，你甚至可能因为断网而没法远程连接 OpenWrt 修复；也不要轻易在 X86 硬件中安装 RouterOS 作为路由器，因为 RouterOS 非常挑硬件，遇到不兼容的硬件时网络吞吐性能会受到巨大的影响。如果喜欢亲力亲为 DIY 的，可以考虑在独立的 X86 硬件物理安装 pfSense、OPNsense、Sophos 作为路由器（不要安装在虚拟机中）；不喜欢折腾硬件的可以考虑购买一台 MikroTik 原厂搭载 RouterOS 的路由器；至于我，选择了更无脑的方案 ——

[](#UniFi "UniFi")UniFi
-----------------------

> 本文接下来所有的配置都是基于 UniFi Network 的 Web UI 讲解的，不过其中的思路、最佳实践都是通用的、可以移植到所有网络部署方式中的。为了避免本文被人认为是 UniFi 的软文，我接下来将先花 2500 字左右，狠狠痛批一下 UniFi 所有软件 Bug、硬件缺陷和愚蠢的产品设计思路。

### [](#BugFi "BugFi")BugFi

UniFi 不论从性能、稳定性、技术支持还是售后来看，都不是一个合适的企业级组网方案。UniFi 的软件上上下下全都是 Bug，下图便是我使用 UniFi 四个月以来向 UniFi 提交过的 Bug Report：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

其中不乏一些可笑又荒唐的 Bug，例如：

*   预计只需要 3 至 5 分钟就可以完成的固件升级，实际上持续了 65 分钟，且经常升级失败
*   UniFi AP 检测到自己的 uplink 只有 10 Mbps（`E`）、但是 iperf3 却可以轻松跑到 945 Mbps
*   UniFi 部分型号 AP 在检测 DFS 信道时存在大量误报，经常错误地关闭 5 GHz 天线、或者频繁切换信道
*   在 UniFi 控制平面的设备拓扑图中，UniFi AP 竟然变成了 UniFi 网关的上游、而 UniFi 网关变成了和电脑手机一样的 UniFi AP 下游设备。
*   UniFi 力排众议，坚持将单独的 UniFi OS 设置界面合并到别的 UniFi 功能（网络、VoIP、门禁、监控）同级的设置菜单中，结果 UniFi 在功能上线时设置错了 Feature Flag、导致 UniFi OS 设置界面和 UniFi 功能设置菜单全都无法访问、导致完全无法修改设备的硬件设置。UniFi 花了 48 小时才修复了这个问题。
*   即使在 UniFi 网关上为端口设置了 Native VLAN，第三方网管交换机在申请 DHCP 时仍然会拿到非 Native VLAN 的 DHCP IP 地址，但是如果在第三方网管交换机上手动绑定静态 IP、UniFi 网关依然可以正确打上 Native VLAN 的 Tag。
*   已经离线 23 小时的 UniFi 设备在 UniFi 站点管理器中却显示在线、SLA 100%。UniFi 花了一周才修复了幽灵设备的 Bug。
*   UniFi 网关内置的 Speedtest 功能，当 WAN 是 PPPoE 接入时就无法记录历史 Speedtest 结果数据。虽然我并不知道 WAN 上网方式与存储 Speedtest 结果有什么关系，然而这个 Bug 据称从 2021 年、我接触 UniFi 的两年前开始就一直存在，直到我忍无可忍提交工单、直接和 UniFi 技术支持团队沟通，UniFi 才在本文写就的一周前修复了这个 Bug，直到本文写就，该 Bugfix 仍然在内测。

除了上述日常家用就能遇到的 Bug 之外，UniFi 在企业级网络组网中也存在大量严重缺陷：

*   UniFi 的硬件性能非常孱弱，直到今年才推出了 IDS/IPS（入侵检测与防御）全开下 依然能保证 10 Gbps 双工吞吐的企业级设备、官方售价 1999 USD。售价在 379 USD 到 599 USD 的 1U 机架式 家庭 / SOHO 级 UniFi 网关（UDM Pro/SE/Pro Max）在开启 IDS/IPS 后最大理论吞吐不过 3.5 Gbps 双工。
*   UDM SE 相比 UDM Pro，RJ45 的 LAN 口从 GbE 升级到 2.5 GbE，但是却存在 Inter-VLAN Routing 时吞吐量达到 2 Gbps 时断流、乃至端口 shut down、甚至 Kernel Panic 的问题，UniFi 官方、UniFi 国内代理商和都承认这是 Known Issue、并且建议用 SFP 光口暂时绕过该问题。该问题自从 UDM SE 发布起就存在，至今没有修复。
*   UDM Pro/SE 的内置 8 口 LAN 交换机只使用一个 GbE 的 PCIE 通道连接 CPU（即 UDM Pro/SE 上的一组 8 个 LAN 口本质上是一个 uplink 是 fixed GbE 的交换机），且这 8 口不能启用 STP/RSTP。
*   UniFi 网关最多只支持添加 64 个 VLAN，意味着 UniFi 网关不适用于超过 200 人、60 或者更多个部门的企业办公网络组网。
*   UniFi 网关的 IDS/IPS 最多只能支持 10 个 VLAN，而 UniFi 官方甚至推荐只为 3 个甚至更少的 VLAN 开启 IDS/IPS。
*   UniFi 直到 2024 年才为旗下交换机添加了 ACL 支持，而即使到本文写就，UniFi 三层交换机的 ACL 依然不支持 VLAN 间单向隔离（OEM 硬件和芯片都是公版、固件也是支持的，UniFi 只是不知道怎么在控制平面的 UI 上加几个复选框罢了）
*   UniFi 对企业网络高可用的概念一窍不通，UniFi 所有 Enterprise 产品线的交换机均不支持 Hot swapable PDU（热更换电源）。想要保障电源高可用必须额外购买 UniFi 昂贵的非标准 1U 机架式 DC 电源（UniFi RPS）。但是 UniFi RPS 仅支持热备切换，不支持热恢复（如果需要修复设备的内置 PDU、并恢复从内置 PDU 供电，仍需要设备断电）。
*   UniFi 直到 2023 年才开发了 VRRP 功能，一直内测到 2024 年才正式上线；直到 2024 年才开始推出支持热更换电源模组的设备。

虽然 UniFi 当前、以及在可预见的未来内都完全不适合用于企业级办公网络组网，但是 UniFi 绝大部分 Bug 暂时不算致命，在日常家庭网络、小宾馆和小餐馆公共网络这类没有高可用、高安全需求的场景下，UniFi 还是游刃有余的。UniFi 最近也开始在家庭和小规模网络上发力，推出一些中低端和「桌面级」设备（如 UniFi Express、UCG Ultra、UCG Max、Flex Mini 2.5G，等等）。加上 UniFi 主打傻瓜式网络配置，在 Cisco、Juniper、Aruba、Rukus、TP-Link 上需要 CLI 才可以实现的配置，在 UniFi 中，只需要浏览器打开控制平面鼠标点点即可完成，一些简单的操作甚至可以通过手机 UniFi App 完成，大幅降低了家庭网络管理的门槛。

### [](#UniFi-网关 "UniFi 网关")UniFi 网关

UniFi 网络有关的产品线主要分为云网关（UCG，UniFi Cloud Gateway）、普通网关（UXG，UniFi Next-gen Gateway，其中 Next-gen 是相对于上一代网关 USG、UniFi Security Gateway 的）、AC 控制器（UCG，UniFi Cloud Key）、无线 AP（UAP 和 U 数字）和交换机（US、USW）。其中 UCG 相当于同时内置了路由器、防火墙和 AC 控制器（一些 UniFi 云网关还可以管理门禁、VoIP 电话、UniFi 功放、还内置了硬盘槽作为 NVR），而 UXG 只内置了路由器和防火墙，需要单独搭配控制器硬件（UCK）和 NVR、或者 self-host UniFi 控制器软件、或者购买 UniFi 官方的云控制器订阅制 SaaS 服务、或者购买非 UniFi 官方的云控制器订阅制 SaaS 服务（如 HostFi 等）。对于绝大部分家庭和小规模网络直接选择 UCG 云网关即可，少数企业为了符合自己的信息安全政策、或者已经单独购买了 UniFi 企业级控制器硬件（UCK Enterprise），那么可以选择不自带控制器的 UXG 网关。不论是 UCG 云网关、UCK 控制器、还是 UniFi 的云管理 SaaS，都可以直接在 `unifi.ui.com` 的控制平面上管理 UniFi 网络（接管在第三方 UniFi 托管控制器 SaaS 服务的设备需要再第三方的控制面板管理，界面与 `unifi.ui.com` 类似）。

我自己使用的 UniFi 网关是桌面级的 UCG Ultra（UniFi Cloud Gateway Ultra），内置一个 2.5 GbE 的 WAN 和 4 个 GbE LAN（其中一个 Port 可以 remap 到 WAN 组双 WAN）；支持网络路由、防火墙和 AC 控制器和功能、不支持门禁管理、VoIP、监控 NVR 功能；在开启 IDS/IPS 后依然可以实现全 GbE Inter-VLAN Routing。这也是我最推荐入门 UniFi 网络的设备。

> 和 UCG Ultra 相同规格的还有 UCG Max，内置 1 个 2.5 GbE 的 WAN 和 4 个 2.5 GbE 的 LAN（其中一个一样可以 remap 成 WAN），并且除了支持网络外，还额外支持 VoIP、门禁、监控等 UniFi 功能。不过我并不推荐 UCG Max，因为 UniFi 的设备本就性能孱弱、UCG Max 和 UCG Ultra 使用相同的 CPU 却要去支持更多的功能。此外，几乎所有的 UniFi 代理商都在以 100% 的溢价 销售 UCG Max，因此与其看中全 2.5 GbE 端口和全 UniFi 功能 去选择 UCG Max，不如直接一步到位 1U 机架式的 UDM Pro/UDM SE。

### [](#双-WAN "双 WAN")双 WAN

除了少数入门级 UniFi 网关如 UniFi Express 和 UniFi Dream Router（UDR）以外，其余 UniFi 网关均支持双 WAN，支持「负载均衡」和「故障转移」。然而，和 OpenWrt 使用 MWAN3、爱快配置多 WAN 叠加不同，UniFi 的双 WAN 的「负载均衡」并不是为一两台设备多线程下载时叠加带宽设计的，而是为应对部署大型网络（例如超过 200 台设备）同时使用网络时准备的。在实现上，UniFi 双 WAN 负载均衡是基于来源和目标的 IP 端口五元组的。

除了「负载均衡」和「故障转移」，UniFi 也支持通过配置 NAT 和 PBR（Policy-based Routing，策略路由）来固定一部分网络请求使用固定某个 WAN。

[](#VLAN "VLAN")VLAN
--------------------

### [](#划分-VLAN "划分 VLAN")划分 VLAN

VLAN 对于大规模网络是必不可少的，企业可以将不同的设备、不同的部门、不同的服务、不同的安全等级划分到不同的 VLAN 中，不仅可以大幅改善网络性能（通过 VLAN 压缩和限制广播域、避免数十个设备位于同一个广播域下引发广播风暴和环路），而且也便于实施部门间隔离和服务间隔离以提升网络安全性，也可以更灵活地部署 QoS/Speed Limit。

在家庭网络和小规模网络中，虽然不至于划分数十个 VLAN，但是依然可以划分将家里网络划分出三五个 VLAN，用来隔离网络设备、访客、物联网，提升安全性。例如 IoT 物联网设备，经常不会收到固件更新和漏洞修复、极其容易被入侵并被黑客作为跳板机攻入内网其他设备，因此可以将 IoT 设备划分到一个独立的 VLAN 中、并配置相对应的防火墙规则和 ACL 将 IoT VLAN 和其他 VLAN 隔离开来。

我自己在网络中划分了五个 VLAN、默认的 VLAN 1 作为管理网，给我自己的电脑手机使用的核心网络分了 VLAN 10、访客网络 VLAN 20、专门用于 IoT 设备的 VLAN 30、和运营商赠送的运行 Android 4.2 的机顶盒单独的 VLAN 40。每个 VLAN 分配一个 /24，CIDR 格式为 `10.[站点编号].[VLAN ID]/24`，这样不仅可以快速通过 IP 地址判断设备所在 VLAN，还可以避免站点之间组网时网段冲突；VLAN ID 和 CIDR 之间间隔 9 个 `/24`，这样即使单个 VLAN 需要容纳超过 200 个设备（在家庭网络环境中几乎不可能发生）时可以快速向相邻 CIDR 方向扩充 DHCP 地址池。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

### [](#VLAN-单向隔离 "VLAN 单向隔离")VLAN 单向隔离

除非手动启用了「Isolate Network」或者「Guest Network」，UniFi 默认所有 VLAN 之间都可以互相通信。在家庭网络环境中，为一个 VLAN 启用「Isolate Network」、将其与其余所有 VLAN 隔离开来，并不方便日常使用和管理，例如我们并不想 IoT 设备主动扫描和访问你的电脑和手机，但是你可能会用电脑和手机主动访问和配置 IoT 设备。为了方便日常管理 IoT 设备，常见的方案是 VLAN 单向隔离，即一些网络可以主动访问 IoT VLAN，但是 IoT VLAN 不能主动访问其他网络。

> 当然，对于一些企业网络来说，部署 VLAN 单向隔离可能依然不够安全。更安全的做法是完全隔离 IoT VLAN，并在 IoT VLAN 中设置一台跳板机、防火墙中仅放行该跳板机。所有管理均通过跳板机访问 IoT VLAN。

在 UniFi 网关上，有三种方式可以配置 VLAN 单向隔离：

#### [](#Traffic-Rules "Traffic Rules")Traffic Rules

Traffic Rules，也就是 Simple 模式提供一个非常简单的配置，动作可以选择拦截、放行或者限速；来源可以选择 VLAN 或者设备；目标除了可以选择 CIDR、VLAN 或者设备，还可以选择域名、应用、IP 归属国家等；而且 Traffic Rules 还可以配置流量方向和生效时间段。因此使用 Traffic Rules 配置 VLAN 单向隔离，只需要来源选择 IoT VLAN、目标选择需要被隔离的 VLAN 即可、流量方向选择「Source to Destination」即可。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

Traffic Rules 的优势在于配置简单易懂，缺点在于不能调整顺序。因此如果你需要实现一些例如「将 VLAN 中除某一个设备以外的剩余所有设备 和其它 VLAN 隔离开来」复杂逻辑，就比较难通过多条 Traffic Rules 实现。

#### [](#Firewall-Rules "Firewall Rules")Firewall Rules

Firewall Rules，也就是 Advanced 模式，提供的选项就和绝大部分网络产品防火墙一样灵活了。动作没有了限速，但是可以选择 Reject（也就是 RST）还是 Drop，来源和目标可以选择 MAC 地址、IP 地址池或者 VLAN；取消了流量方向匹配，提供的是更底层的状态机匹配（`New`、`Invalid`、`Established`、`Related`）、IPSec 选项和日志。UniFi 文档中有 [关于 Advanced Firewall Rules 的介绍](https://help.ui.com/hc/en-us/articles/115003173168-UniFi-Gateway-Advanced-Firewall-Rules)，但是简单来说，为了实现 VLAN 单向隔离，需要设置 Type 为 LAN In（即流量从局域网 LAN 进入 UniFi 网关），Action 选择 Reject 或者 Drop，在 State 中只选择 `New`（即仅匹配发起连接的数据包）；IPSec 选项则是该防火墙规则是否对 UniFi 免费提供的站点组网功能（即 Site-to-Site VPN）生效；是否启用 Logging 主要取决于个人偏好、不过也要小心一些廉价的 IoT 设备 引发重试风暴 把日志系统拖垮。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

需要注意，和 Traffic Rules 一次可以选择多个目标不同，每条 Firewall Rules 只能配置一个 IP 地址池、一段 CIDR、或一个 VLAN，因此在 IoT VLAN 与多个 VLAN 之间部署单向隔离时，需要创建多条 Firewall Rule。

#### [](#Firewall-Rules-Isolate-Network "Firewall Rules + Isolate Network")Firewall Rules + Isolate Network

单独使用 Traffic Rules 或 Firewall Rules 已经可以实现 VLAN 单向隔离，但是每当创建了新的 VLAN 时（在家庭网络中 VLAN 基本固定，但是在企业网络中 VLAN 变动是十分常见的）都需要修改之前创建的 Traffic Rules 或 Firewall Rules、使 IoT VLAN 单向隔离对新创建的 VLAN 也生效，大大增加了维护成本，还容易忘记。

在创建 VLAN 时，UniFi 可以选择「Isolate Network」，这样 UniFi 会自动在 Firewall Rules 创建一条 LAN In 规则，将该 VLAN 和其他所有 VLAN（包括未来可能新创建的 VLAN）全部双向隔离开来。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

> 如上图中所示，UniFi 自动创建了一条 Firewall Rules，阻止了 IoT VLAN 向所有 VLAN 发送任何数据包；其他 VLAN 仍然可以主动向 IoT VLAN 发送数据包，但是 IoT VLAN 收到数据包后不能回包。

在双向隔离的基础上，我们再配置一条 Firewall Rules，放行 IoT VLAN 到指定 VLAN 的 `Established` 和 `Related`（即由指定 VLAN 发起的连接，IoT 设备可以回包），就实现了单向隔离。这种配置方法可以自动隔离未来新创建的 VLAN，要优雅得多。

在具体配置时，为了便于理解避免出错，我先列了一张表格记录了所有 VLAN 之间的隔离规则：

<table><thead><tr><th>DST \ SRC</th><th>Default</th><th>Primary</th><th>Guest</th><th>IoT</th><th>TV Box</th></tr></thead><tbody><tr><td>Default</td><td>N/A</td><td>Allow</td><td>Block</td><td>Block</td><td>Block</td></tr><tr><td>Primary</td><td>Allow</td><td>N/A</td><td>Block</td><td>Block</td><td>Block</td></tr><tr><td>Guest</td><td>Allow</td><td>Allow</td><td>N/A</td><td>Block</td><td>Block</td></tr><tr><td>IoT</td><td>Allow</td><td>Allow</td><td>Block</td><td>N/A</td><td>Block</td></tr><tr><td>TV Box</td><td>Allow</td><td>Allow</td><td>Allow</td><td>Block</td><td>N/A</td></tr></tbody></table>

在这张表格中，每一纵列表头的 VLAN 主动访问下面每行的 VLAN，每一横行表头的 VLAN 则向每列 VLAN 回包。其中，默认 VLAN（管理 VLAN） 1 和 Primary VLAN 10 可以访问所有 VLAN，访客 VLAN 20 仅允许主动访问电视机顶盒 VLAN 40（开放无线投屏），而 IoT VLAN 30 和机顶盒 VLAN 40 不能主动访问任何 VLAN。因此，我们需要为访客 VLAN 20、IoT VLAN 30 和机顶盒 VLAN 40 启用 Isolate Network、并分别添加下述 Firewall Rules 放行 `Established` 和 `Related`（即放行回包）：

*   `[Isolation] Allow Default -> Guest`: Guest VLAN 20 -> Default VLAN 1
*   `[Isolation] Allow Primary -> Guest`: Guest VLAN 20 -> Primary VLAN 10
*   `[Isolation] Allow Default -> IoT`: IoT VLAN 20 -> Default VLAN 1
*   `[Isolation] Allow Primary -> IoT`: IoT VLAN 20 -> Primary VLAN 10
*   `[Isolation] Allow Default -> TV Box`: TV Box VLAN 40 -> Default VLAN 1
*   `[Isolation] Allow Primary -> TV Box`: TV Box VLAN 40 -> Primary VLAN 10
*   `[Isolation] Allow Guest -> TV Box`: TV Box VLAN 40 -> Guest VLAN 20

> 需要注意的是，规则的名称中的方向似乎和规则配置的方向相反，是因为规则名称在描述从源到目标生效的方向，而规则实际上是在放行反向的回包。

当所有的 Isolation Network 和 Firewall Rules 都配置完成后，Firewall Rules 列表的 LAN In 和 LAN Out 规则就成了这样：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

[](#防火墙 "防火墙")防火墙
-----------------

除了 VLAN 单向隔离意外，我们还需要额外配置一些防火墙规则去更好运行家庭网络。

UniFi 网关上搭载的操作系统 UniFi OS 基于 Debian，因此 UniFi 的网络栈自然而然延续 Linux 内核的行为，

### [](#阻止局域网流量泄漏到互联网 "阻止局域网流量泄漏到互联网")阻止局域网流量泄漏到互联网

在默认情况下，Linux 启用 IP 转发后、会将没有匹配到路由表条目的流量会被从默认路由直接转发出去，UniFi OS 也不例外。因此，目的地为 RFC1918 的 IPv4 或 ULA 的 IPv6 的局域网内流量也有可能被 UniFi 从 WAN 泄漏出去，这部分流量会被直接发送到互联网上。为了避免局域网内流量被发送到互联网上，我们首先需要在 UniFi 中添加保留 IP 的 IP Group：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

```
RFC1918 & RFC2544 (Private IPv4)

IPv4 Address / Subnet

10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
198.18.0.0/15
```

```
RFC4193 (IPv6 ULA/Private)

IPv6 Address / Subnet

fc00::/7
```

接着为 `Internet Out` 和 `Internet v6 Out` 分别添加一条 Firewall Rules 匹配上述 IP Group，将其动作设置为 Drop：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

### [](#阻止-Invalid-状态的数据包泄漏到互联网 "阻止 Invalid 状态的数据包泄漏到互联网")阻止 Invalid 状态的数据包泄漏到互联网

UniFi 的 Firewall Rules 依赖 Conntrack（前文中提到的 UniFi Firewall Rules 中的 New、Established、Related、Invalid 状态正是基于 Conntrack 的）。

Netfilter 在 NAT 时不知道如何处理 Invalid 状态的数据包，所以 Netfilter 在转发 IP 数据包时会直接将 Invalid 状态的数据包不做任何 NAT 直接原样转发出去，[参考 Netfilter Bugzilla 的 Issue 693](https://bugzilla.netfilter.org/show_bug.cgi?id=693)，[VyOS 在其 NAT 文档中也提到这一点](https://docs.vyos.io/en/latest/configuration/nat/nat44.html#avoiding-leaky-nat)。产生 Invalid 数据包的可能性有很多，最常见的情况是 TCP 连接已经标记为关闭以后仍然试图发送 `RST`。

绝大部分网络设备系统（例如 RouterOS 和 VyOS）也使用了同样的策略，方便网络管理员和开发者调试网络协议。而对于大部分网络部署来说都应该 Drop 掉从 WAN 口出去的 Invalid 数据包、避免 NAT 泄漏。

UniFi 默认内置只读的 Firewall Rules 只会 Drop 通过 WAN 口进来（`Internet In` 和 `Internet v6 In`）的 Invalid 数据包，但是对于从 WAN 口出去的 Invalid 数据包（`Internet Out` 和 `Internet v6 Out`）则默认放行。因此，我们可以为 `Internet Out` 和 `Internet v6 Out` 分别添加一条 Firewall Rules，来源和目标均设置为 Any，匹配 `Invalid` 状态的数据包，动作设置为 Drop：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

[](#安全设置 "安全设置")安全设置
--------------------

除了通过 Firewall Rules 以外，我们还可以启用 UniFi 内置的其它安全设置来进一步保护家庭网络安全。

> UniFi 网关内置的安全设置也就只能保护家庭网络免受一些简单的攻击。为企业级网络部署安全防御只建议使用 Sophos、Palo Alto、Fortinet、Check Point、Cisco 等专业的企业防火墙。

### [](#IDS-IPS "IDS/IPS")IDS/IPS

UniFi 内置了简单的 IDS/IPS 功能，可以检测和阻止一些简单的网络攻击。我为我的所有 VLAN 启用的 IDS/IPS，并启用了「暗网拦截」和「危险 IP 拦截」。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

UniFi 支持对 35 种流量进行检测、并识别这些流量中的特征指纹：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

### [](#蜜罐 "蜜罐")蜜罐

通常来说，如果有 IoT 设备被黑客入侵后，黑客会尝试扫描局域网内的其它设备并尝试入侵它们。我们可以在局域网内一些未使用的 IP 建立蜜罐，当这些 IP 接收到任何网络数据包，我们就知道局域网内有设备正在扫描内网（例如在使用 nmap）。UniFi 内置了蜜罐功能，我们可以为每个 VLAN 设置蜜罐 IP：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

### [](#加密-DNS "加密 DNS")加密 DNS

UniFi 网关内置了基于 Unbound 的 DNS 递归服务器，因此支持 DNSCrypt / DNS over TLS / DNS over HTTPS 协议（截至本文写就，UniFi 内置的 Unbound 仍然是旧版本，因此不支持 DNS over QUIC / DNS over HTTP/3 / Oblivious DoH）的加密 DNS 称为「DNS Shield」。但是 UniFi 不支持直接配置域名和端口，只支持 DNSStamps 配置，我们可以用 [DNSCrypt 网站中的 DNS Stamps 计算器](https://dnscrypt.info/stamps/) 生成 DNS Stamps，然后添加到 UniFi 中。

> 除了蜜罐和加密 DNS 以外，UniFi 的安全功能还包括基于 MAC 地址的设备型号识别和基于域名、SNI、IP、协议的流量识别、基于国家 Geo IP 的流量拦截和基于 DNS 和域名的广告拦截。但是 UniFi 的广告拦截列表并不公开也不可配置，而且充满误杀。我推荐所有家庭网络或者企业网络自建递归 DNS 服务器（例如 AdGuardHome 或者 Pi-Hole）来实现广告拦截功能。

[](#交换机 "交换机")交换机
-----------------

交换机分为基于 MAC 地址的二层交换机和基于 IP 地址的三层交换机。二层交换机工作在链路层（也就是 OSI 模型的二层），基于以太网帧的 MAC 地址决定以太网帧需要发送到哪里去，来自同一个广播域（每个 VLAN 就是一个属于自己的广播域）下的设备可以互相交换流量、不在同一个广播域下的设备需要转发给三层设备（例如上游的路由器和三层交换机）去做交换；三层交换机不仅可以工作在链路层，还可以基于 IP 工作在网络层（OSI 模型的三层），三层交换机可以实现在不同广播域间交换流量。只有管理型交换机支持配置 VLAN（当然也可以配置其他功能，如链路聚合、QoS、ACL），不带管理的「傻瓜」交换机可能会透传 VLAN，也可能会 strip 掉以太网帧的 VLAN Tag、也可能会直接丢弃所有带有 VLAN Tag 的以太网帧。

一般来说，绝大部分家庭网络只需要二层网管交换机即可，因为如上所述，家庭网络和企业办公网不同，只会划分三五个 VLAN 用于隔离访客和物联网设备等、绝大部分时候不同 VLAN 间设备很少互相访问、即使需要互相访问也不需要低延迟和高吞吐，使用路由器进行 VLAN 间路由就足够了。而且三层交换机的价格普遍比二层交换机高出不少。如果你确实使用了三层交换机、并且启用了三层功能如 VLAN 间路由，那么你可能还需要额外部署交换机 ACL 规则（VLAN 间流量现在可以在三层交换机上直接交换、不再经过网关，网关上配置的防火墙规则（例如 UniFi 的 Traffic Rules 和 Firewall Rules）就不再生效了，需要配置交换机 ACL。

我的核心交换机选择了一个国产 Hasivo 的 2.5 GbE 带 PoE 和 PoE+（总共可输出 60W PoE 功率）的二层网管交换机作为我的核心汇聚交换机，我的 AP、以及书房的交换机的 uplink 也接在该交换机上；我接着选择了 UniFi 带网管和 PoE 受电的五口迷你二层交换机 USW Flex Mini、用来连接一些需要 Tag VLAN 的设备（例如我的摄像头和电视机顶盒）。

相比在 UniFi 的 Web UI 管理端口与 VLAN，在 Hasivo 交换机的网管界面操作要相对复杂一些。由于这台 Hasivo 交换机作为我的核心交换机，所以所有端口需要被设置为 Full Trunk（即所有端口均接受所有 VLAN）；由于我不想为书房里所有设备手动设置 VLAN、因此我直接在 Hasivo 交换机上将书房的端口的 Native VLAN 设为 Primary VLAN 10，其余端口均使用默认 VLAN 1。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

首先在 Hasivo 交换机的 802.1Q VLAN 界面、将我的 4 个 VLAN 全部添加到 VLAN 列表中，使得 Hasivo 交换机可以识别这些 VLAN。接着修改各个端口的 VLAN 分配。由于通往书房的端口 4 默认需要使用 Primary VLAN 10，因此 VLAN 10 的 Native VLAN（也就是「不带标签端口」）需要设置为 4，其余端口均设置为 Tagged VLAN（即「带标签端口」）；由于端口 4 不再使用默认 VLAN，因此需要在默认 VLAN 1 中将端口 4 移出 Native VLAN、并添加到 Tagged VLAN 中。

> 由于我可能需要在书房中进行一些网络调试和维护，因此我没有在其他的非默认 VLAN 中移除端口 4，所有 VLAN 的流量都可以通过端口 4（Full Trunk）。

接着需要配置端口 4 为所有没有 VLAN 的流量打 VLAN Tag。在 Hasivo 交换机的 802.1Q VID 界面、设置端口 4 的 VID 为 10，维持默认接受所有帧。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

由于 Hasivo 交换机的网管界面依然延续了 CLI 的风格，所有界面上的改动应用后只保存在寄存器中、交换机重启后配置就会丢失，需要手动将这些配置落盘。在「工具 - 配置」界面中点击「保存」按钮将配置保存到交换机的 Flash 存储中。

[](#AP-和-Wi-Fi "AP 和 Wi-Fi")AP 和 Wi-Fi
--------------------------------------

### [](#SSID "SSID")SSID

在 UniFi 控制平面中，除了可以管理 SSID，还可以观察所有 AP 当前运行的信道频段、并且可以可视化地添加信道黑名单。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

一个 UniFi AP 最多可以支持 8 个 SSID（如果启用了 Wireless Meshing 就只能支持 4 个 SSID，因为需要创建隐藏 SSID 专门用于 AP 间通信）。我创建了 3 个 SSID，分别用于我自己的主网络、IoT 和访客网络（访客 Wi-Fi 的密码非常难以猜到呢 Ciallo～(∠・ω<)⌒☆）。

UniFi 支持 PPSK（Private Pre-shared Key），即一个 SSID 支持多个密码，使用不同的密码可以将设备分配到不同的 VLAN。但是 PPSK 的原理是 WPA2P 在认证时使用了弱编码，AP 可以通过 Master Session Key 逆向出认证流程中使用的密码，而 WPA3 采用了更安全的认证流程，因此不再支持 PPSK，而 6 GHz（Wi-Fi 6E、Wi-Fi 7）必须使用 WPA3，意味着在 6 GHz 广播的 SSID 需要和使用 PPSK（WPA2）的 SSID 分开。

UniFi 的无线产品自从上市以来就以不兼容大量 IoT 设备而臭名昭彰，UniFi 在 2024 年第四季度终于痛下决心开始优化 IoT 设备的兼容性，推出了「Enhanced IoT Connectivity Mode」（截至本文写就，该功能仍处于内测阶段）。启用该功能后，UniFi AP 会只工作在 2.4 GHz 频段、强制启用 WPA2、压缩 Wi-Fi 传输帧、以及禁用 UAPSD、MLO、802.11r（快速漫游）等一系列功能，以提升 IoT 设备的兼容性：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

而在我自己的主网络 SSID 上，因为所有设备都是我可控的，因此我可以放心地启用一些设置：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

其中值得注意的设置有：

*   Wi-Fi Band：由于 2.4 GHz 频率低、穿墙能力强的特点，导致了 2.4 GHz 频段的拥挤和互相干扰，因此我关闭了 2.4 GHz 频段，只使用 5 GHz 和 6 GHz 两个频段。
*   MLO：全称是 Multi-Link Operation，是一项 Wi-Fi 7 新特性，可以让 Wi-Fi 7 设备同时连接同一 AP 的不同频段，大幅增加吞吐量。截至本文写就，UniFi AP 的 MLO 仍然处于内测阶段，而且实现有大量 Bug（例如 MLO 导致 UniFi AP 偶发性崩溃和重启），但是并不妨碍我吃螃蟹。
*   Band Steering：UniFi AP 会主动将支持 5 GHz 的设备连接到 5 GHz 频段。由于 SSID 就没有启用 2.4 GHz，因此我没有启用 Band Steering。
*   Client Device Isolation：启用后，同一 SSID 下的设备不能互相访问。常见于访客网络 SSID。
*   Proxy ARP：在 Wi-Fi 的高延时、低吞吐的特性下，ARP 广播会大量浪费性能；如果大量无线设备同时在线，甚至可能引发广播风暴。启用 Proxy ARP 后可以大幅改善广播性能。

> 工作在二层的以太网使用 MAC 地址进行寻址，而三层的 IP 协议使用的是 IP 地址，如果源设备不知道目标设备的 MAC 地址，就会发送 ARP 广播向所有设备询问「请问你们中谁的 IP 地址是我的目标 IP 地址，并且告诉我你的 MAC 地址」。但是，通常在一个广播域（例如同一个 VLAN）下的设备并不一定在同一个物理 LAN 下，而可能是被 AP、交换机、路由器等物理隔开。如果没有 Proxy ARP，坐落在两个物理 LAN 中间的 AP、交换机、路由器设备就必须转发 ARP 广播和回复。  
> 然而，这些中间设备自己的 ARP 表通常已经缓存了两边设备的 MAC 地址和 IP 地址的对应关系。启用了 Proxy ARP 后，这些中间设备可以「劫持」ARP 广播、避免 ARP 广播从一个物理 LAN 扩散到另一个物理 LAN、缓解了潜在的广播风暴。中间设备并将自己的 MAC 地址回复给源设备。现在源设备会直接把流量发给中间设备，而中间设备再根据自己的 ARP 表转发流量到目标设备。

*   UAPSD：即 Unscheduled Automatic Power Save Delivery 或 WMM-Power Save。支持 UAPSD 的无线网卡在宿主设备（电脑、手机）睡眠时会和 AP 协商进入低功耗 PS-Mode。启用 UAPSD 后，大部分现代的电脑和手机睡眠续航时长会增加，但是不支持 UAPSD 的设备（尤其是 IoT 设备）会遇到兼容性问题。我的主网络设备都是我可控的，因此我启用了 UAPSD。
*   Wi-Fi Speed Limit：在 UniFi 中先添加 Wi-Fi 限速 Profile，然后在这里为 SSID 启用该限速 Profile。
*   Multicast Enhancement：启用 IGMPv3，将支持多个目标设备接收的 Multicast 广播变成单个目标设备接收的 Unicast 流量，限制广播范围从而缓解潜在的广播风暴。
*   Multicast and Broadcast Control：显式限制 AP 转发 Multicast 广播的来源和目标 MAC 地址，从而缓解潜在的广播风暴。通常只需要在超过 100 个设备的 SSID 中启用。
*   MAC Address Filter：通过 MAC 地址限制设备连接到 SSID。这是一个高级功能，而拉黑蹭网设备的操作通常是在 UniFi Network 的「Client Devices」中进行的。

### [](#AP "AP")AP

UniFi 2024 年推出了支持 Wi-Fi 7 的 U7 系列 AP，所以我马上把之前用的 U6+ 出给了同事，然后消费升级到 U7 Pro。

截至本文写就，市面上在售的 UniFi AP 有支持 Wi-Fi 5 的 UAC 系列 AP、支持 Wi-Fi 6 的 U6 系列 AP 和支持 Wi-Fi 7 的 U7 系列 AP，其中：

*   U6 Lite 是一款低成本 Wi-Fi 6 AP，2.4 GHz 仅支持 Wi-Fi 4 和 2 x 2 SU-MIMO、最大吞吐 300 Mbps；5 GHz 支持 2 x 2 MU-MIMO，最大吞吐 1.2 Gbps。U6 Lite 已经停产，性价比更高的 U6 Plus 代替了 U6 Lite 的位置。
*   U6 Plus 是一款代替 U6 Lite 产品位置的低成本 Wi-Fi 6 AP，2.4 GHz 和 5 Ghz 均支持 Wi-Fi 6 和 2 x 2 MU-MIMO，且 2.4 GHz 增加 40 Mhz 信道宽度、支持 5 GHz 新增 160 Mhz 信道宽度支持，因此 2.4 GHz 最大吞吐提升到 574 Mbps、5 GHz 最大吞吐提升到 2.4 Gbps。这款 AP 适合小规模网络部署、或在大规模网络中用于覆盖死角。
*   U6 Pro 是一款 Wi-Fi 6 旗舰 AP，相比 U6 Plus，5 GHz 增加到 4 天线、支持 4 x 4 MU-MIMO，因此 5 GHz 最大吞吐提升到 4.8 Gbps，适合较大规模网络部署。
*   U6 LR 是一款 Wi-Fi 6 旗舰 AP，相比 U6 Pro 使用 PoE 供电，U6 LR 需要 PoE+ 供电。相比 U6 Pro，U6 LR 的 2.4 GHz 也增加到 4 天线，因此 2.4 GHz 和 5 GHz 都支持 4 x 4 MU-MIMO。但是 U6 LR 并没有提升 2.4 GHz 天线发射功率，却降低了 5 GHz 的天线发射功率，导致 U6 LR 的 2.4 GHz 覆盖相比 U6 Pro 并没有明显提升，但是 5 GHz 覆盖却有所下降。因此 U6 LR 仅仅适合在拥有大量 2.4 GHz 设备的场景下使用（去最大化利用 2.4 GHz 的 4 天线），其他场景下使用 U6 LR 无异于嫌弃自己钱太多并决定把钱送给 Ubiquiti。
*   U6 Enterprise 是一款支持 Wi-Fi 6E 和 6 GHz 的企业级 AP，相比 U6 Pro 额外增加了 2 根 6 GHz 天线，额外支持 6 GHz 的 2 x 2 MU-MIMO，6 GHz 最大吞吐 5.7 Gbps。U6 Enterprise 也是首款使用 2.5 GbE uplink 的 UniFi AP（UniFi 此前绝大部分 AP 使用 GbE uplink、体育场馆级别的堡垒 AP 则使用 10 GbE uplink）。
*   U6 IW、U6 Enterprise IW 的 Wi-Fi 配置和性能和 U6 Pro、U6 Enterprise 相同，但是支持安装在墙面的 86 型开关盒上。除此以外，U6 系列的 IW 型 AP 还额外内置 4 口 GbE 交换机。
*   U7 Pro 是 UniFi 第一款 Wi-Fi 7 旗舰 AP。虽然是一款「Pro」AP，但是性能几乎全面追平 U6 Enterprise 并部分反超。U7 Pro 的 2.4 GHz、5 GHz、6 GHz 均支持 Wi-Fi 7、均使用 2 x 2 MU-MIMO。相比 U6 Enterprise 的 5 GHz 用 4 根天线达到最大 4.8 Gbps 的吞吐，U7 Pro 的 5 GHz 虽然只有 2 根天线，却也达到了 4.3 Gbps 的最大吞吐（因为 U7 Pro 可以在 5 GHz 启用 240 Mhz 信道频宽、而 U6 系列的 5 GHz 只支持 160 Mhz 信道频宽）。U7 Pro 的 2.4 GHz 和 6 GHz 的最大吞吐相比 U6 Enterprise 同样也有提升，分别达到了 688 Mbps 和 5.7 Gbps。这也是我部署的 AP。
*   U7 Pro Max 相比 U7 Pro，5 GHz 额外增加了 2 根天线凑到了 4 x 4 MU-MIMO、最大吞吐达到了 5.7 GHz。除此以外，U7 Pro Max 还额外内置了一根不参与 Wi-Fi 广播的天线，相比 UniFi 其他 AP 需要中断 Wi-Fi 才能扫描周边的信道环境（RF Scan）、U7 Pro Max 可以使用额外的天线全天候进行 RF Scan 和监控、以及实现 Zero-wait DFS。
*   U7 Pro Wall 和 U7 Pro 的 Wi-Fi 配置和性能相同，并支持安装在墙面的 86 型开关盒上。但是相比 U6 系列的墙面 AP，U7 Pro Wall 没有内置交换机，Ubiquiti 表示他们后续的 U7 系列 AP 会重新加回内置交换机。

[](#DNS "DNS")DNS
-----------------

之前在大学时认识的一个朋友，现在在做信创，几个月前线下面基吃饭的时候送了我一块搭载 RK3588 的 SBC Pi（Single Board Computer、单板电脑），甚至还支持 PoE/PoE+ 受电。这次借着部署网络，我拿出这块 SBC 刷了个 Debian 12 Minimal arm64 Unofficial，在上面跑了一个 AdGuardHome 作为局域网内的 DNS 服务器。

### [](#Debian-12-设置连接多-VLAN "Debian 12 设置连接多 VLAN")Debian 12 设置连接多 VLAN

由于我已经在网络中划分了五个 VLAN，因此有以下几种办法让我自建的 AdGuardHome 同时作为这些 VLAN 的递归 DNS 服务器：

*   在 UniFi 网关上配置 DNAT 规则（是的，UniFi 终于在 2024 年支持了 NAT 规则），将 UDP 53 流量全部转发到局域网内的 AdGuardHome。但是这样做会导致 AdGuardHome 无法获取客户端的真实 IP 地址，而且可能导致潜在的 DNS 回环问题（UniFi 网关将 UDP 53 流量转发给 AdGuardHome、AdGuardHome 再将 UDP 53 流量发出经过 UniFi 网关）。
*   让 AdGuardHome 监听在管理网 VLAN 下、并专门将 AdGuardHome 在 VLAN 单向隔离中加白。但是这样导致几乎所有设备的 DNS 流量都需要 Inter-VLAN Routing。
*   让 AdGuardHome 同时监听在所有 VLAN 下，修改每个 VLAN 的 DHCP 选项将 DNS 服务器设置为 AdGuardHome 的 IP 地址，这是目前的最佳实践。

我刷的 Debian 12 build 默认使用 NetworkManager 作为网络管理器，所以我决定直接使用 `nmcli` 管理网络。使用 `nmcli` 创建多个 VLAN 连接：

```
sudo nmcli connection add type vlan ifname eth0.10 dev eth0 id 10 con-name "Wired connection VLAN 10" ipv4.method auto 802-3-ethernet.cloned-mac-address [mac address]
```

其中 `eth0.10` 是 VLAN 10 的接口名、`eth0` 是物理接口名、`10` 是 VLAN ID、`Wired connection VLAN 10` 是连接名。

需要注意的是，新建的 VLAN 连接和 Untagged 连接默认使用物理网卡的 MAC 地址，而这会导致 UniFi 网关 Panic、导致 UniFi 的 Web UI 显示爆炸。为了美观，上述命令通过设置 `802-3-ethernet.cloned-mac-address` 属性来修改 MAC 地址。

然后我们可以在 UniFi 的 Web UI 中看到新的 DHCP Session，我们可以设置一个固定 IP 地址：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

回到 Debian 12 重启网络连接、重新获取 DHCP Session 即可拿到新的固定 IP：

```
sudo nmcli connection down "Wired connection VLAN 10"
sudo nmcli connection up "Wired connection VLAN 10"
```

重复上述操作，为每个 VLAN 创建连接，现在 Debian 上已经拿到了 5 个 VLAN 下的 5 个 IP 地址：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

### [](#配置-AdGuardHome "配置 AdGuardHome")配置 AdGuardHome

首先是 General Settings，需要注意不要轻易启用「Use AdGuard browsing security web service」和「Use AdGuard parental control web service」。AdGuardHome 会同步阻塞地向 `family.adguard-dns.com` 发起 DNS 解析请求，因此如果 AdGuardHome 实例到 AdGuard DNS 服务器的网络连接不通畅的话会严重影响 DNS 解析速度。

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

然后是 DNS Settings 配置上游 DNS 服务器，我这里使用了「Load-balancing」模式，也推荐所有人都使用这个模式。在这个模式下，AdGuardHome 会记录所有上游 DNS 服务器的解析成功率、延时等信息加权随机选择上游 DNS 服务器，既可以避免单点故障、也不会导致某个特别慢的上游 DNS 服务器拖慢整个 DNS 解析速度。「Parallel Requests」会同时向所有上游 DNS 发起请求、并使用最快的响应、从而提升解析速度，但是由于最近国内各大公共 DNS 都在推动 Rate Limit，平行并发请求来自同一公共 DNS 的不同 IP 或域名 极易消耗完 quota 被封禁。「Fastest Request」是请求所有上游 DNS 服务器、对每一个响应中的所有 IP 地址进行 ping、选择最快的 IP 地址，此时 AdGuardHome 需要等待所有上游 DNS 响应、还要进行额外的 ping 操作、不仅大幅影响 DNS 解析速度，而且 ICMP 延时最低的 IP 建立 TCP 连接时的耗时也并不一定最低。如果真的需要降低上网延时，Surge 的并发对所有 IP 发送 TCP SYN 进行握手并选择最快完成握手的连接进行后续请求，是更优雅的实践（Clash.Meta 也实现了类似的特性，但是需要手动开启 `tcp-concurrent-mode` 选项）。

AdGuardHome 的上游 DNS 服务器配置支持不同域名使用不同 DNS 服务器进行解析。如果想要实现像我在「[我有特别的 Surge 配置和使用技巧](https://blog.skk.moe/post/i-have-my-unique-surge-setup/#DNS-Fen-Liu-She-Zhi)」一文中提到的「阿里系域名使用阿里公共 DNS 解析，腾讯系域名使用 DNSPod 公共 DNS 解析，百度、字节、360 系域名也分别用各自家的公共 DNS」的 DNS 分流效果的话，我的 [SukkaW/Surge](https://github.com/SukkaW/Surge) 项目里也维护了适用于 AdGuardHome 的分流 Mapping，只需要复制粘贴到 AdGuardHome 的配置文件中即可，需要注意将 `10.10.1.1:53`（用于解析内网域名）替换为你的路由器的 IP 地址：

```
https://ruleset.skk.moe/Internal/dns_mapping_adguardhome.conf
```

还有值得注意的设置是「Access settings」。由于我的 AdGuardHome 仅限于局域网内使用，因此我直接配置了仅允许 Loopback IP 地址和 RFC1918 IPv4 地址使用 AdGuardHome：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)

```
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
```

关于 AdGuardHome 中的 DNS Blocklist，我同样使用了「[我有特别的 Surge 配置和使用技巧](https://blog.skk.moe/post/i-have-my-unique-surge-setup/#Yan-Gao-Lan-Jie-x2F-Yin-Si-Bao-Hu-x2F-Bing-Du-Lan-Jie-x2F-Diao-Yu-He-Zha-Pian-Yu-Ming-Lan-Jie)」中提到的域名分流规则，[SukkaW/Surge](https://github.com/SukkaW/Surge) 项目里现在也提供了适用于 AdGuard 和 AdGuardHome 格式的 Blocklist：

```
https://ruleset.skk.moe/Internal/reject-adguardhome.txt
```

> 虽然上述 DNS Blocklist 只包含 11 万条域名，但是相比某号称「致力于成为中文区命中率最高的广告过滤列表」、却产生极大量误杀百度、Bilibili、闲鱼的正常域名，甚至曾经无脑屏蔽 `cdn.jsdelivr.net` 的拦截列表项目相比，我的 DNS Blocklist 不仅足够涵盖绝大部分场景、而且因为选用了正确的上游数据源、最大程度减少了误杀。如果上游数据源发生误杀，所有使用 AdGuard、AdBlock Plus、uBlock Origin 的用户都会受到影响，上游数据源自然会第一时间修复。

### [](#配置-DHCP-使局域网设备使用-AdGuardHome "配置 DHCP 使局域网设备使用 AdGuardHome")配置 DHCP 使局域网设备使用 AdGuardHome

配置完 AdGuardHome 并经过测试后，我们就可以在 UniFi 的 Web UI 中修改各个 VLAN 的 DHCP 配置，将 DNS 服务器设置为 AdGuardHome 的 IP 地址了。我的 AdGuardHome 监听在每个 VLAN 的 DHCP IP 池中的 `.53` IP 上（例如 `10.10.10.53`）：

![](data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=)