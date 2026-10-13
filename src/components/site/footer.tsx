import TextLoop from "@/components/site/text-loop";

export function Footer() {
  return (
    <footer>
      <div className="aspect-[1200/520] w-full">
        <TextLoop
          text="Case Study Generator ✦ The Convergence HQ"
          shape="wave"
          speed={40}
          separator="✦"
          curviness={90}
          fontSize={34}
          fontWeight={800}
          letterSpacing={1}
          color="#ffffff"
          separatorColor="#c7ccfd"
          ribbon
          ribbonColor="#5e6ad2"
          ribbonWidth={90}
          pauseOnHover
        />
      </div>
    </footer>
  );
}
