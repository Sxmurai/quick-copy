const { Plugin } = require("powercord/entities");
const { clipboard } = require("electron");

const { inject, uninject } = require("powercord/injector");
const { getModule, React } = require("powercord/webpack");

module.exports = class QuickCopy extends Plugin {
  async startPlugin() {
    const messageMenu = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );

    const menu = await getModule(["MenuItem"]);

    inject("CopyContentToClipboard", messageMenu, "default", (args, res) => {
      res.props.children.push(
        React.createElement(menu.MenuItem, {
          name: "Copy to Clipboard",
          id: "CopyToClipboard",
          label: "Copy to Clipboard",
          action: () => {
            const { content, attachments } = args[0].message;

            let str = "";

            if (content) str += content;
            if (attachments && attachments.length)
              str += `\n${attachments.map((a) => a.url).join("\n")}`;

            clipboard.writeText(str ?? "No content");
          },
        })
      );

      return res;
    });
  }

  pluginWillUnload() {
    uninject("CopyContentToClipboard");
  }
};
