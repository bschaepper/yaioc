
export interface IContainer {

    register<TYPE extends Function>(object: TYPE): void;
    register<TYPE extends Function>(object: { default: TYPE }): void;
    register<TYPE>(name: string, object: TYPE): void;

    registerConstructor<TYPE extends Function>(constructorFunction: { new(...args: any[]): TYPE }, dependencyNames?: string[]): void;
    registerConstructor<TYPE extends Function>(name: string, constructorFunction: { new(...args: any[]): TYPE }, dependencyNames?: string[]): void;

    registerValue<TYPE>(name: string, object: TYPE): void;

    registerFactory<TYPE>(name: string, factory: (...args: any[]) => TYPE, dependencyNames?: string[]): void;

    registerAdaptor<TYPE>(name: string, adaptor: TYPE): void;

    cache(): IContainer;

    get<TYPE>(name: string, target?: unknown): TYPE;

    scanComponents(path: string): void;

}

export interface IYaiocConstructor {
    (): IContainer;
    container(childContainer?: IContainer): IContainer;
}

export interface IContainerAdaptor<T> {
    getComponentInstance(conatiner: IContainer, target?: string): T
}
