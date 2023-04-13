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
  const question = $("#input").value;
  if (question.trim() === "") {
    renderMessageTip("不能输入空的内容");
    return;
  }
  if (question.length > 3000) {
    renderMessageTip("输入不能超过3000字哦");
    return;
  }
  $("#input").value = "";

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

// 一些初始化
const init = () => {
  // 关联回车和发送触发 handleSend
  document.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      handleSend();
    }
  });
  $("#sendButton").addEventListener("click", handleSend);
  $("#menuButton").addEventListener("click", handleMenuClick);

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
  }
};
init();
