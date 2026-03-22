import ParticlesBg from "../../components/ParticlesBg/ParticlesBg";
import ResetPasswordPage from "../../components/ResetPasswordPage/ResetPasswordPage";

function ResetPasswordScreen() {
  return (
    <div className="cyber-app-shell relative min-h-dvh flex flex-col overflow-hidden">
      <ParticlesBg />
      <main className="relative grow flex items-center justify-center w-full px-6 py-10">
        <ResetPasswordPage />
      </main>
    </div>
  );
}

export default ResetPasswordScreen;
