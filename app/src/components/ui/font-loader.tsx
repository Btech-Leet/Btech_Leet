"use client";

export function FontLoader() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      media="print"
      onLoad={(e) => {
        (e.currentTarget as HTMLLinkElement).media = "all";
      }}
    />
  );
}
