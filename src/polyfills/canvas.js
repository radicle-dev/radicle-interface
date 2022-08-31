// A simple mock for some HTMLCanvasElement functions to run in a node env.

HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => null,
});

HTMLCanvasElement.prototype.toDataURL = () => null;
