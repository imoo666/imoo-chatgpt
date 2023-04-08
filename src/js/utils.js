import { markedParse } from "./marked";
import copy from "copy-to-clipboard";

export const $ = document.querySelector.bind(document);
let id = 0; // 用于 render 计数

// 渲染对话节点
export const render = (item) => {
  const isUser = item.role === "user";
  const container = $("#container");
  const direction = isUser ? "row-reverse" : "row";
  const background = isUser ? "#c0c0c0" : "grey";
  const color = isUser ? "rgb(92, 219, 88)" : "white";
  const content = isUser ? item.content : markedParse(item.content);
  const absoluteDir = isUser ? "left" : "right";

  container.insertAdjacentHTML(
    "beforeend",
    `
      <div style="display: flex; flex-direction: ${direction}; margin-top: 10px; width: 100%; box-sizing: border-box; padding: 10px;">
        <div style="width: 40px; height: 40px; border-radius: 5px; background: ${background}; flex-shrink: 0; margin-${absoluteDir}: 10px"></div>
        <div style="padding: 10px; border-radius: 5px; background: ${color}; overflow-wrap: break-word; position: relative; max-width: calc(100% - 50px); box-sizing: border-box;">
          <div style="position: absolute; ${absoluteDir}: -10px; top: -30px; font-size: x-small; color: #bbb7b7; cursor: pointer; font-weight: 300; padding: 5px; margin: 5px" id="copy${id}">复制</div>
          ${content}
        </div>
      </div>
    `
  );
  $(`#copy${id}`).addEventListener("click", () => {
    copy(item.content);
    renderMessageTip("复制成功");
  });

  id++;
  // 置底
  $("#container").scrollTop = 999999;
};

// 渲染错误提示
export const renderErrorTip = (message = "出现异常，请重试") => {
  container.insertAdjacentHTML(
    "beforeend",
    `
        <div style="display: flex; justify-content: center; font-size: small; margin: 10px 12px">
          <div style="color: grey;">${message}</div>
        </div>
      `
  );
  $("#container").scrollTop = 999999;
};

// 渲染普通提示
export const renderMessageTip = (info, time = 3000) => {
  const tip = document.createElement("div");
  tip.classList = "tip";
  tip.innerHTML = info;
  $("body").insertAdjacentElement("beforeend", tip);
  setTimeout(() => {
    $("body").removeChild(tip);
  }, time);
};

// 渲染卡片
export const renderCard = ({ title = "", body = "", id = "", events = [] }) => {
  $("body").insertAdjacentHTML(
    "beforeend",
    `<div class="imoo-mask card${id}">
      <div class="imoo-card">
        <div class="imoo-card-title">
          <div class="imoo-card-close"></div>
          <div>${title}</div>
          <div class="imoo-card-close" id="card${id}-close">-</div>
        </div>
        <div class="imoo-card-body">
            <div>
                ${body}
            </div>
            <div class="imoo-card-events">
                ${events
                  .map(
                    (item) =>
                      `<div id="card-event-${item.name}">${item.name}</div>`
                  )
                  .join("")}
            </div>
        </div>
      </div>
    </div>`
  );

  // 关闭卡片
  const close = () => {
    const target = document.querySelector(`.card${id}`);
    $("body").removeChild(target);
  };

  // 绑定事件
  $(`#card${id}-close`).addEventListener("click", close);
  events.forEach((item) => {
    $(`#card-event-${item.name}`).addEventListener("click", item.click);
  });

  return close;
};

// 二次确认
export const renderConfirm = ({ title = "确定操作吗", onOk }) => {
  const close = renderCard({
    title: title,
    events: [
      {
        name: "确定",
        click: () => {
          onOk();
          close();
        },
      },
      {
        name: "取消",
        click: () => {
          close();
        },
      },
    ],
  });
};

// 获取对象数组的最后n项，该n项的对象的 content 字数之和不超过 maxSize，n最多不超过maxNumber
export const getLastItems = (list, maxSize = 3000, maxNumber = 10) => {
  const sumLength = list.map((item) => item.content).join("").length;
  if (sumLength < maxSize && list.length < maxNumber) {
    return list;
  }
  const lastList = [];
  const reverseList = list.reverse();
  let sum = 0;
  reverseList.every((item) => {
    sum += item.content.length;
    if (sum < maxSize && lastList.length < maxNumber) {
      lastList.unshift(item);
      return true;
    } else {
      return false;
    }
  });
  return lastList;
};
