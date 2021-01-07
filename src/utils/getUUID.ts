/** UUID 为零表示当前标记 */
const getUUID = (() => {
  let uuid = 0;
  return () => {
    ++uuid;
    return (
      Math.random()
        .toString(16)
        .slice(2) + uuid
    );
  };
})();

export default getUUID;
