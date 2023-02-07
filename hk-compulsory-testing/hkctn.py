import PyPDF2
import requests
from datetime import date, timedelta

# Variables
today = date.today()
yesterday = date.today() - timedelta(days=1)
ctn_date = today.strftime("%Y%m%d")
ctn_url = "https://www.chp.gov.hk/files/pdf/ctn_" + ctn_date + ".pdf"
ctn_file = "/www/workspace/hkctn/ctn.pdf"
search_term = "{XXXXXXXX}"

# Telegram bot
tg_token = "{XXXXXXXX}"
tg_chatid = "{XXXXXXXX}"
parse_mode = "HTML"

# Download today's compulsory testing notice
response = requests.get(ctn_url)
file = open(ctn_file, "wb")
file.write(response.content)
file.close()

# Search building in compulsory testing notice
file = open(ctn_file, "rb")
result = 0
try:
    pdf = PyPDF2.PdfFileReader(file)
except:
    result = -1
else:
    for page_number in range(0, pdf.numPages):
        page = pdf.getPage(page_number)
        page_content = page.extractText()
        if search_term in page_content:
            result = 1
            break
file.close()

# Send Telegram message
if result == 0:
    message = "<b>🔵 新冠强制检测公告</b>\n\n无需接受检测\n\n" + ctn_url
elif result > 0:
    message = "<b>‼️ 新冠强制检测公告</b>\n\n需要接受检测\n\n" + ctn_url
else:
    message = "<b>🔴 新冠强制检测公告</b>\n\n错误: 没有找到文件或读取文件失败"

tg_api = f"https://api.telegram.org/bot{tg_token}/sendMessage?chat_id={tg_chatid}&parse_mode={parse_mode}&text={message}"
print(requests.get(tg_api).json())