export interface IDependencyGraphPrinter {
    draw(): string;
}
export interface IDependencySchema {
    getSchema(): [name: string, deps: string[]][];
    getDependencyDotFile(): string;
}

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

    getDependencyGraph(name: string): IDependencyGraphPrinter;
    getDependencySchema(): IDependencySchema;

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
