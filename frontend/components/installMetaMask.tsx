import React from "react";

const InstallMetaMask: React.FC = () => {
  return (
    <div>
      <a
        href="https://metamask.io/"
        target="_blank"
        rel="noreferrer"
        style={{
          color: "blue",
        }}
      >
        MetaMask
      </a>
      をインストールしてください
    </div>
  );
};

export default InstallMetaMask;
