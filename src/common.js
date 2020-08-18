const keypress = async () => {
  console.log("Press any key to continue...");
  process.stdin.setRawMode(true);
  return new Promise((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
};

const prettyPrint = (response) =>
  console.log(JSON.stringify(response, null, 2));

module.exports = { keypress, prettyPrint };
