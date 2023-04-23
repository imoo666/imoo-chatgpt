import { apiUrl } from "../../api";
import {
  render,
  renderErrorTip,
  renderMessageTip,
  getLastItems,
  renderCard,
  $,
  renderHistory,
} from "./utils";
import { doInstruction } from "./instruction";
import { getMessage } from "./message";
import { markedParse } from "./marked";
import { tips } from "./constant";
import { handleMenuClick } from "./menu";

// 查询
const query = async (queryItem) => {
  const key = localStorage.getItem("key");
  const history = getLastItems(
    JSON.parse(localStorage.getItem("history")),
    2000,
    20
  );
  try {
    const _data = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, messages: getMessage(queryItem, history) }),
    });
    const data = await _data.json();
    const replyItem = data.choices[0].message;

    if (replyItem.content.startsWith("/服务错误-")) {
      // 当服务错误时停止
      renderErrorTip(replyItem.content.replace("/服务错误-", ""));
    } else {
      // 没错误就正常渲染
      render(replyItem);
      history.push(queryItem, replyItem);
      localStorage.setItem("history", JSON.stringify(history));
    }
  } catch (err) {
    renderErrorTip("网络异常，稍后再试试吧~");
  }

  // 取消 loading
  const sendButton = $("#sendButton");
  const dot = $("#dot");
  sendButton.classList.remove("loading");
  dot.classList.add("hidden");
};

// 用于触发查询
export const handleSend = () => {
  // 去掉前后的空格和回车
  const question = $("#input").value.replace(/\s*$/, "");

  if (question.trim() === "") {
    renderMessageTip("不能输入空的内容");
    return;
  }
  if (question.length > 3000) {
    renderMessageTip("输入不能超过3000字哦");
    return;
  }

  // 销毁和重新计算
  $("#input").value = "";
  calcHeight();

  // 斜杠开头都是指令
  if (question.startsWith("/")) {
    doInstruction(question);
    return;
  }

  // 还在 loading 时不允许请求
  const sendButton = $("#sendButton");
  const dot = $("#dot");
  if (sendButton.classList.contains("loading")) {
    renderMessageTip("imoo 还在冥思苦想，请稍等");
    return;
  }
  // 进入 loading 状态，开始查询
  sendButton.classList.add("loading");
  dot.classList.remove("hidden");
  const queryItem = { role: "user", content: question };
  render(queryItem);
  query(queryItem);
};

// 计算高度
const calcHeight = () => {
  // 防止删除时，scrollHeight 无法恢复
  $("#input").style.height = 0;
  // 计算高度，其中 20 是内边距
  $("#input").style.height = $("#input").scrollHeight - 20 + "px";
};

// 一些初始化
const init = () => {
  // 关联回车和发送触发 handleSend
  $("#sendButton").addEventListener("click", handleSend);
  $("#menuButton").addEventListener("click", handleMenuClick);
  $("#input").addEventListener("input", (e) => {
    calcHeight();
  });
  $("#input").addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      handleSend();
      // 将消息拉到最低以免影响查看
      $("#container").scrollTop = 999999;
    }
  });

  // 基本配置项设置与检查
  if (localStorage.getItem("key") === null) {
    renderCard({ title: "提示", body: markedParse(tips) });
    localStorage.setItem("key", "temp");
  }
  if (localStorage.getItem("key") === "temp") {
    renderErrorTip("未登录状态，已自动接入测试账号");
  }
  if (localStorage.getItem("history") === null) {
    localStorage.setItem("history", JSON.stringify([]));
  }
  // 进入页面清空预设
  localStorage.setItem("lock", "");

  // 进入页面时，渲染历史记录
  const historyList = JSON.parse(localStorage.getItem("history")) || [];
  if (historyList.length > 0) {
    renderHistory();
  } else {
    $("#input").placeholder = "在此输入您的问题吧~";
    const queryItem = {
      role: "assistant",
      content: "我是人工智能 imoo，今天有什么能帮您~",
    };
    render(queryItem);
  }
};
init();
