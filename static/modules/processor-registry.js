let processors = [];

export function registerProcessor(tagName, typ) {
    customElements.define(tagName, typ);
    const inst = new typ();
    processors.push([inst.name, tagName]);
}

export function getProcessors() {
    return processors;
}
