import { Button, BUTTON_VARIANTS } from "./lib";

function App() {
  const onClick = (variant: string) => {
    console.log(`${variant} button clicked`);
  };

  return (
    <>
      <Button onClick={() => onClick("primary")}>primary</Button>
      <Button onClick={() => onClick("disabled")} disabled>
        disabled
      </Button>
      <Button
        variant={BUTTON_VARIANTS.SUCCESS}
        onClick={() => onClick(BUTTON_VARIANTS.SUCCESS)}
      >
        {BUTTON_VARIANTS.SUCCESS}
      </Button>
      <Button
        variant={BUTTON_VARIANTS.WARNING}
        onClick={() => onClick(BUTTON_VARIANTS.WARNING)}
      >
        {BUTTON_VARIANTS.WARNING}
      </Button>
      <Button
        variant={BUTTON_VARIANTS.DANGER}
        onClick={() => onClick(BUTTON_VARIANTS.DANGER)}
      >
        {BUTTON_VARIANTS.DANGER}
      </Button>
    </>
  );
}

export default App;
