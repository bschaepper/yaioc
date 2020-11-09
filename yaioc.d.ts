
export interface IContainer {

    register<TYPE extends Function>(object: TYPE);
    register<TYPE extends Function>(object: { default: TYPE });
    register<TYPE>(name: string, object: TYPE);

    registerConstructor<TYPE extends Function>(constructorFunction: { new(...args: any[]): TYPE }, dependencyNames?: string[]);
    registerConstructor<TYPE extends Function>(name: string, constructorFunction: { new(...args: any[]): TYPE }, dependencyNames?: string[]);

    registerValue<TYPE>(name: string, object: TYPE);

    registerFactory<TYPE>(name: string, factory: (...args: any[]) => TYPE, dependencyNames?: string[]);

    registerAdaptor<TYPE>(name: string, adaptor: TYPE);

    cache(): IContainer;

    get<TYPE>(name: string, target?: unknown): TYPE;

    scanComponents(path: string): void;

}

interface IYaiocClassConstructor {
    new(childContainer?: IContainer): IContainer
}

export interface IYaiocConstructor {
    (): IContainer;
    container(childContainer?: IContainer): IContainer;
    Container: IYaiocClassConstructor;
}

export interface IContainerAdaptor<T> {
    getComponentInstance(conatiner: IContainer, target?: string): T
}

declare var defaultExport: IYaiocConstructor;
export default defaultExport;
