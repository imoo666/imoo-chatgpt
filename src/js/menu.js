import { news } from "./constant";
import { markedParse } from "./marked";
import escape from "lodash.escape";
import {
  $,
  getLastItems,
  renderCard,
  renderConfirm,
  renderHistory,
  renderMessageTip,
} from "./utils";
import { player } from "./prompts";
// import { handleSend } from "./index";

const renderMemoList = (memoList) => {
  $("#memo-list").innerHTML = memoList
    .map((_, index) => {
      return `<div style="width: 100%; margin-bottom: 20px;border: 1px solid gray; border-radius: 5px; padding: 10px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between">
          <div>${index + 1}</div>
          <div id="imoo-remove${index}" >-</div>
        </div>
        <input id="imoo-user${index}" placeholder="输入问题" />
        <input id="imoo-assistant${index}" placeholder="输入回答" />
      </div>`;
    })
    .join("");

  memoList.forEach((item, index) => {
    $(`#imoo-user${index}`).value = escape(item.user);
    $(`#imoo-assistant${index}`).value = escape(item.assistant);

    $(`#imoo-remove${index}`).addEventListener("click", () => {
      memoList.splice(index, 1);
      renderMemoList(memoList);
    });
    $(`#imoo-user${index}`).addEventListener("input", () => {
      memoList[index].user = $(`#imoo-user${index}`).value;
    });
    $(`#imoo-assistant${index}`).addEventListener("input", () => {
      memoList[index].assistant = $(`#imoo-assistant${index}`).value;
    });
  });
};
export const handleMenuClick = () => {
  const closeMenu = renderCard({
    id: "menu",
    title: "菜单",
    events: [
      {
        name: "公告",
        click: () =>
          renderCard({
            title: "公告",
            body: markedParse(news),
            style: "padding-top: 0",
          }),
      },
      {
        name: "清空记录",
        click: () => {
          renderConfirm({
            title: "确定清空吗",
            onOk: () => {
              $("#container").innerHTML = "";
              localStorage.setItem("history", JSON.stringify([]));
              closeMenu();
            },
          });
        },
      },
      {
        name: "显示配置",
        click: () =>
          renderCard({
            title: "配置",
            body: `用户：${localStorage.getItem("key")}`,
          }),
      },
      {
        name: "预设角色",
        click: () =>
          renderCard({
            title: "预设角色",
            events: player.map((item) => ({
              name: item[0],
              click: () => {
                $("#input").value = item[1];
                renderMessageTip("角色已载入输入框");
              },
            })),
          }),
      },
      {
        name: "捏造记忆",
        click: () => {
          const closeMemo = renderCard({
            title: "捏造记忆",
            body: `
              <div id="memo-list"></div>
              <div class="memo-button button-primary" id="memo-add">新增记忆</div>
              <div class="memo-button button-primary" id="memo-use">使用记忆</div>
            `,
          });

          const history = getLastItems(
            JSON.parse(localStorage.getItem("history")),
            2000,
            20
          );
          // 过滤掉第一个元素的角色不是用户的条目
          if (history[0]?.role !== "user") {
            history.shift();
          }
          // 将用户和助手的消息分别收集到对应的数组中
          const memoList = [];
          const userList = [];
          const assistantList = [];

          history.forEach((item) => {
            if (item?.role === "user") {
              userList.push(item.content);
            } else {
              assistantList.push(item.content);
            }
          });
          // 将两个数组合并成一个对象数组
          for (let i = 0; i < userList.length; i++) {
            memoList.push({ user: userList[i], assistant: assistantList[i] });
          }

          renderMemoList(memoList);
          $("#memo-add").addEventListener("click", () => {
            memoList.push({ user: "", assistant: "" });
            renderMemoList(memoList);
          });
          $("#memo-use").addEventListener("click", () => {
            renderConfirm({
              title: "确认使用记忆吗",
              onOk: () => {
                const newHistory = memoList
                  .map((item) => {
                    return [
                      { role: "user", content: item.user },
                      { role: "assistant", content: item.assistant },
                    ];
                  })
                  .flat();
                renderHistory(newHistory);
                localStorage.setItem("history", JSON.stringify(newHistory));
                renderMessageTip("imoo 正在使用该记忆");
                closeMemo();
                closeMenu();
              },
            });
          });
        },
      },
    ],
  });
};
