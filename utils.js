function filterDescriptors(descriptors, filterFn) {
    if (!descriptors) {
        // return falsy values as-is
        return descriptors;
    }

    if (descriptors instanceof Array) {
        return descriptors.filter(filterFn);
    }

    const entries = Object.entries(descriptors).filter(([, descriptor]) =>
        filterFn(descriptor)
    );

    return entries.reduce(
        (obj, [key, value]) => ({ ...obj, [key]: value }),
        {}
    );
}

exports.filterDescriptors = filterDescriptors;
