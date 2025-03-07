import { HelloWorldLabel } from "components/hello-world-label";

export default function Home() {
  return (
    <main>
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold">Hello Wrold</h1>
          <HelloWorldLabel />
        </div>
      </div>
    </main>
  );
}
