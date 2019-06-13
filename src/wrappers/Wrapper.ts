export default abstract class Wrapper<V> {
  protected _name!: string;
  abstract value: V;

  setPropertyName(name: string) {
    this._name = name;
  }
}
