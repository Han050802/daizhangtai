# 中企鸿昌代账台

中企鸿昌代账台是在电脑上运行的记账工作台。后端使用 Python 和 SQLite，前端在浏览器中打开，无需构建。

## 功能

- 客户档案、代账进度、合同收款、票据和税务记录。
- 会计凭证、余额表、明细账、财务报表和工资表。
- 银行流水与发票核对、原件归档、销售辅助台和税务清算报告。

## 本机启动

安装 Python 3.12。Windows 安装时将 `python` 加入 PATH，然后运行以下命令。

```powershell
git clone https://github.com/Han050802/daizhangtai.git
cd daizhangtai
python -X utf8 -B server.py --host 127.0.0.1
```

首次启动后，打开终端显示的一次性链接，设置机构名称和三名操作员各自的账号和密码。之后访问 `http://127.0.0.1:8765/`。如果该端口已被占用，可在启动命令中加上 `--port 8875`，并使用终端显示的对应地址。按 `Ctrl+C` 停止前台运行的服务。

Windows 办公室局域网可双击 `start.cmd`，由主机启动后台服务，并在可信局域网内共享启动器给出的主机地址。双击 `stop.cmd` 停止后台服务。想先试用，可在本机运行独立演示账套。

```powershell
python -X utf8 -B server.py --host 127.0.0.1 --port 8766 --demo
```

演示入口为 `http://127.0.0.1:8766/`。演示账号为 `demo1`、`demo2`、`demo3`，演示密码均为 `DemoOnly123!`。演示账号仅在演示模式下创建。

## PDF 与图片识别

需要 PDF 解析和图片识别时，在运行工作台的同一个 Python 环境中安装以下依赖。

```powershell
python -m pip install pypdf pypdfium2 Pillow rapidocr-onnxruntime
```

## 账套和备份

正式账套保存在本机 `data/`，演示账套保存在 `demo-data/`。可在工作台“设置 → 数据备份”下载含数据库和附件的 ZIP。恢复前先停止服务，然后运行以下命令。

```powershell
python -X utf8 -B maintenance.py restore PATH_TO_BACKUP.zip --data-dir data
```

## 前端检查

安装 Node.js 后，在仓库根目录运行前端语法检查和税务清算模块的合成数据测试。

```powershell
npm.cmd run check
npm.cmd run test:tax-liquidation
```
