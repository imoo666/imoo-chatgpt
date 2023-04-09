import { markedParse } from "./marked";
import escape from "lodash.escape";
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
  const content = isUser ? escape(item.content) : markedParse(item.content);
  const absoluteDir = isUser ? "left" : "right";
  const currentId = id;

  container.insertAdjacentHTML(
    "beforeend",
    `
      <div style="display: flex; flex-direction: ${direction}; margin-top: 10px; width: 100%; box-sizing: border-box; padding: 0 6px;" id="wrapper-copy${currentId}">
        <div style="width: 30px; height: 30px; border-radius: 5px; background: ${background}; flex-shrink: 0; margin-${absoluteDir}: 6px"></div>
        <div style="padding: 6px 10px; border-radius: 5px; background: ${color}; overflow-wrap: break-word; position: relative; max-width: calc(100% - 72px); box-sizing: border-box;">
          <div style="position: absolute; ${absoluteDir}: -35px; top: 2px; font-size: x-small; color: #bbb7b7; cursor: pointer; font-weight: 300; margin: 5px; opacity: 0" id="copy${id}">复制</div>
          ${content}
        </div>
      </div>
    `
  );
  $(`#copy${currentId}`).addEventListener("click", () => {
    copy(item.content);
    renderMessageTip("复制成功");
  });
  $(`#wrapper-copy${currentId}`).addEventListener("mouseover", function () {
    $(`#copy${currentId}`).style.opacity = 1;
  });
  $(`#wrapper-copy${currentId}`).addEventListener("mouseout", function () {
    $(`#copy${currentId}`).style.opacity = 0;
  });

  id++;
  // 置底
  $("#container").scrollTop = 999999;
};

// 渲染历史记录
export const renderHistory = (_history) => {
  $("#container").innerHTML = "";
  const history = _history || JSON.parse(localStorage.getItem("history"));
  history.forEach((item) => render(item));
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
export const renderCard = ({
  title,
  body = "",
  id = "",
  events = [],
  style = "",
}) => {
  $("body").insertAdjacentHTML(
    "beforeend",
    `<div class="imoo-mask card-${title}-${id}">
      <div class="imoo-card">
        <div class="imoo-card-title">
          <div class="imoo-card-close"></div>
          <div>${title}</div>
          <div class="imoo-card-close" id="card-${title}-${id}-close">-</div>
        </div>
        <div class="imoo-card-body" style="${style}">
            <div>
                ${body}
            </div>
            <div class="imoo-card-events">
                ${events
                  .map(
                    (item, index) =>
                      `<div id="card-event-${title}-${index}">${item.name}</div>`
                  )
                  .join("")}
            </div>
        </div>
      </div>
    </div>`
  );

  // 关闭卡片
  const close = () => {
    const target = document.querySelector(`.card-${title}-${id}`);
    $("body").removeChild(target);
  };

  // 绑定事件
  $(`#card-${title}-${id}-close`).addEventListener("click", close);
  events.forEach((item, index) => {
    $(`#card-event-${title}-${index}`).addEventListener("click", item.click);
  });

  return close;
};

// 二次确认
export const renderConfirm = ({ title = "确定操作吗", onOk }) => {
  const close = renderCard({
    title: title,
    id: "confirm",
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
export const getLastItems = (list, maxSize = 2000, maxNumber = 10) => {
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
