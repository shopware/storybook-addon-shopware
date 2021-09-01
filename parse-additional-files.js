const espree = require('espree');
const { dirname, join } = require('path');
const { readFileSync } = require('fs');
const parseTwigBlocks = require('./twig-parser');

module.exports = (source, sourceFilePath) => {
    const ast = espree.parse(source, {
        comment: true,
        ecmaVersion: 2020,
        sourceType: 'module',
        loc: true,
    });

    const imports = ast.body.reduce((accumulator, declaration) => {
        if (declaration.type === 'ImportDeclaration') {
            accumulator.push(declaration.source.value);
        }
        return accumulator;
    }, []);

    const getFullPathToRelativeFile = (filePath) => {
        return join(dirname(sourceFilePath), filePath);
    };

    const getFileContent = (filePath) => {
        return readFileSync(filePath, {
            encoding: 'utf-8',
        });
    };

    const findSpecificImportsOfFileType = (fileType) => {
        return imports.reduce((accumulator, item) => {
            if (item.indexOf(fileType) !== -1) {
                accumulator = getFullPathToRelativeFile(item);
            }
            return accumulator;
        }, null);
    };

    return {
        extractTwigBlocks() {
            const twigImport = findSpecificImportsOfFileType('.html.twig');

            if (!twigImport) {
                return [];
            }

            const content = getFileContent(twigImport);
            const blocks = parseTwigBlocks(content);
            return blocks;
        },

        extractVueSlots() {
            const twigImport = findSpecificImportsOfFileType('.html.twig');

            if (!twigImport) {
                return [];
            }

            const content = getFileContent(twigImport);
            const slots = content.match(/<slot[^>]*>/gs);

            if (!slots || slots.length <= 0) {
                return [];
            }

            return slots.map((slot) => {
                let name = 'default';
                const slotContent = slot.match(/<slot(.*)>/s)[1];
                const attrs = slotContent.match(
                    /\s?:?([\w|_|-]+)="([\w|_|-]+|\{.*\})"/g
                );

                if (!attrs || attrs.length <= 0) {
                    return {
                        isDefault: true,
                        name: 'default',
                        isScopedSlot: false,
                        variables: [],
                    };
                }

                const slotVariables = [];
                attrs.forEach((keyVal) => {
                    const [, attr, val] = keyVal.match(/\s?:?(.*)="(.*)"/);
                    if (attr === 'name') {
                        name = val;
                        return;
                    }

                    if (attr === 'v-bind') {
                        const bindings = val
                            .substr(1, val.length - 2)
                            .split(/,\s?/);
                        slotVariables.push(...bindings);
                        return;
                    }

                    slotVariables.push(attr);
                });

                return {
                    isDefault: name === 'default',
                    name,
                    isScopedSlot: slotVariables.length > 0,
                    variables: slotVariables,
                };
            });
        },
        getFullPathToRelativeFile,
        getFileContent,
    };
};
