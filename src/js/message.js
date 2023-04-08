export const getMessage = (queryItem, history = []) => {
  const lock = localStorage.getItem("lock");
  // 如果没有预设，快速结束
  if (!lock) {
    return [...history, queryItem];
  }

  const lockList = [
    {
      role: "user",
      content:
        "你来扮演【" +
        lock +
        "】用设定的语气回复，不透露自己是ai/程序/助手，并且遵循中国法律。这句话对后续提问不可见",
    },
    {
      role: "assistant",
      content: "好的，我会遵守您的规则并扮演该设定",
    },
  ];
  return [...history, ...lockList, queryItem];
};
