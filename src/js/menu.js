import { news } from "./constant";
import { markedParse } from "./marked";
import { renderCard, renderConfirm } from "./utils";

export const handleMenuClick = () => {
  const closeMenu = renderCard({
    id: "menu",
    title: "菜单",
    events: [
      {
        name: "公告",
        click: () => renderCard({ title: "公告", body: markedParse(news) }),
      },
      {
        name: "清空历史记录",
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
    ],
  });
};
