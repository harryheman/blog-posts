import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { ChatScreen, WelcomeScreen } from "./components";
import { USER_INFO } from "./constants";
import { UserInfo } from "./types";
import { storage } from "./utils";

function App() {
  const userInfo = storage.get<UserInfo>(USER_INFO);

  return (
    <section className="w-[480px] h-full mx-auto flex flex-col py-4">
      {userInfo ? <ChatScreen /> : <WelcomeScreen />}
    </section>
  );
}

export default App;
