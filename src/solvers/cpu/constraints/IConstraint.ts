export default interface IConstraint {
  stiffness: number;
  solve: (dt?: number) => void;
};
