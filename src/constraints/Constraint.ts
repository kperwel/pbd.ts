export default interface Constraint {
  stiffness: number;
  solve: (dt?: number) => void;
};
