import { marked } from "marked";
import { apiUrl } from "../api";

// 查询
const query = async (queryItem) => {
  const history = JSON.parse(localStorage.getItem("history"));
  const maxLength = Number(localStorage.getItem("max"));
  const lock = JSON.parse(localStorage.getItem("lock"));
  const key = localStorage.getItem("key");

  if (history.length >= maxLength) {
    history.splice(0, history.length - maxLength);
  }
  try {
    const _data = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, messages: [...lock, ...history, queryItem] }),
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
    console.log(err);
    renderErrorTip("您的网络异常，稍后再试试吧~");
  }

  // 取消 loading
  const button = document.querySelector("#button");
  button.classList.remove("loading");
};

// 指令集
const doInstruction = (question) => {
  if (question.startsWith("/set-k")) {
    const newKey = question.split(":")[1];
    localStorage.setItem("key", newKey);
    renderMessageTip("指令：设定口令-成功，开始提问吧~");
    return;
  }
  if (question.startsWith("/set-m")) {
    const newMax = question.split(":")[1];
    if (newMax.length <= 20 && newMax.length > 0) {
      localStorage.setItem("max", newMax);
      renderMessageTip("指令：设定上下文个数-成功");
    } else {
      renderMessageTip("指令：设定上下文个数-失败");
    }
    return;
  }
  if (question.startsWith("/set-l")) {
    const newLock = question.split(":")[1];

    const oldList = JSON.parse(localStorage.getItem("lock"));
    const newList = [{ role: "user", content: newLock }];

    const finalList = [...oldList, ...newList];
    localStorage.setItem("lock", JSON.stringify(finalList));
    renderMessageTip("指令：设定预设-成功，开始提问吧~");
    return;
  }

  switch (question) {
    case "/c":
      document.querySelector("#container").innerHTML = "";
      localStorage.setItem("history", JSON.stringify([]));
      renderMessageTip("指令：删除记录");
      return;
    case "/i":
      const info = ["key", "max", "lock"]
        .map((item) => item + ":" + localStorage.getItem(item))
        .join("; ");
      renderMessageTip(`指令：显示配置。${info}`, 10000);
      return;
    case "/cl":
      localStorage.setItem("lock", JSON.stringify([]));
      renderMessageTip("指令：删除预设");
      return;
    default:
      renderMessageTip(
        "指令：无效指令。问题不支持以斜杠开头，可以尝试在最前面追加空格"
      );
      return;
  }
};

// 用于触发查询
const handleSend = () => {
  // 还在 loading 时不允许请求
  const button = document.querySelector("#button");

  const question = document.querySelector("#input").value;
  document.querySelector("#input").value = "";
  if (question.trim() === "") {
    renderMessageTip("不能输入空的内容");
    return;
  }
  // 斜杠开头都是指令
  if (question.startsWith("/")) {
    doInstruction(question);
    return;
  }

  if (button.classList.contains("loading")) {
    renderMessageTip("imoo 还在冥思苦想，请稍等");
    return;
  }
  // 进入 loading 状态，开始查询
  button.classList.add("loading");
  const queryItem = { role: "user", content: question };
  render(queryItem);
  query(queryItem);
};

// 渲染对话节点
const render = (item) => {
  const container = document.querySelector("#container");
  const direction = item.role === "user" ? "row-reverse" : "row";
  const background = item.role === "user" ? "#c0c0c0" : "grey";
  const color = item.role === "user" ? "rgb(92, 219, 88)" : "white";
  const content = marked.parse(item.content);

  container.insertAdjacentHTML(
    "beforeend",
    `
    <div style="display: flex; flex-direction: ${direction}; margin-top: 10px;">
      <div style="width: 40px; height: 40px; border-radius: 5px; background: ${background}; margin: 0 10px"></div>
      <div style="padding: 10px; border-radius: 5px; max-width: 74%; background: ${color}; overflow-wrap: break-word;">${content}</div>
    </div>
  `
  );

  // 置底
  document.querySelector("#container").scrollTop = 999999;
};

// 渲染错误提示
const renderErrorTip = (message = "出现异常，请重试") => {
  container.insertAdjacentHTML(
    "beforeend",
    `
      <div style="display: flex; justify-content: center; font-size: small; margin: 10px 0">
        <div style="color: grey; margin-right: 4px">${message}</div>
      </div>
    `
  );
  document.querySelector("#container").scrollTop = 999999;
};

// 渲染普通提示
const renderMessageTip = (info, time = 3000) => {
  const tip = document.createElement("div");
  tip.classList = "tip";
  tip.innerHTML = info;
  document.body.insertAdjacentElement("beforeend", tip);
  setTimeout(() => {
    document.body.removeChild(tip);
  }, time);
};

// 关联回车和发送触发 handleSend
document.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    handleSend();
  }
});
document.querySelector("#button").addEventListener("click", handleSend);

// 进入页面时，渲染历史记录
const historyList = JSON.parse(localStorage.getItem("history")) || [];
if (historyList.length > 0) {
  historyList.forEach((item) => render(item));
} else {
  document.querySelector("#input").placeholder =
    "请在此输入您的问题，ai 会火速回复你";
}

// 基本配置项设置与检查
if (localStorage.getItem("key") === null) {
  localStorage.setItem("key", "temp");
}
if (localStorage.getItem("key") === "temp") {
  renderErrorTip("未登录状态，已自动接入测试账号");
}
if (localStorage.getItem("max") === null) {
  localStorage.setItem("max", 2);
}
if (localStorage.getItem("history") === null) {
  localStorage.setItem("history", JSON.stringify([]));
}
if (localStorage.getItem("lock") === null) {
  localStorage.setItem("lock", JSON.stringify([]));
}
