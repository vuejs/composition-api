export default abstract class AbstractWrapper<V> {
  protected _name!: string;
  abstract value: V;

  setPropertyName(name: string) {
    this._name = name;
  }
}
