import { $, renderMessageTip } from "./utils";

// 指令集
export const doInstruction = (question) => {
  if (question.startsWith("/set-k")) {
    const newKey = question.split(":")[1];
    localStorage.setItem("key", newKey);
    renderMessageTip("指令：设定口令-成功，开始提问吧~");
    return;
  }
  if (question.startsWith("/set-l")) {
    const lock = question.replace("/set-l:", "");
    localStorage.setItem("lock", lock);
    renderMessageTip("指令：设定预设-成功，开始提问吧~");
    return;
  }

  switch (question) {
    case "/c":
      $("#container").innerHTML = "";
      localStorage.setItem("history", JSON.stringify([]));
      renderMessageTip("指令：删除记录");
      return;
    case "/i":
      const info = ["key", "lock"]
        .map((item) => item + ":" + localStorage.getItem(item))
        .join("; ");
      renderMessageTip(`指令：显示配置。${info}`, 10000);
      return;
    case "/cl":
      localStorage.setItem("lock", "");
      $("#container").innerHTML = "";
      localStorage.setItem("history", JSON.stringify([]));
      renderMessageTip("指令：删除预设");
      return;
    default:
      renderMessageTip(
        "指令：无效指令。问题不支持以斜杠开头，可以尝试在最前面追加空格"
      );
      return;
  }
};
