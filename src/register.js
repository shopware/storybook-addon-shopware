import React from 'react';
import crypto from 'crypto';
import { addons, types } from '@storybook/addons';
import { useStorybookState } from '@storybook/api';
import { AddonPanel, SyntaxHighlighter } from '@storybook/components';
const ADDON_ID = 'sw-twig-blocks';
const PANEL_ID = `${ADDON_ID}/panel`;

const style =  `
.sw-twig-args-table {
    font-size: 13px;
    line-height: 20px;
    padding: 0;
    border-collapse: collapse;
    width: 100%;
    margin: 2em 0;
    overflow: auto;
}

.sw-twig-args-table tr {
    border-top: 1px solid #eee;
    background-color: #fff;
    margin: 0px;
    padding: 0px;
}

.sw-twig-args-table tr th {
    font-weight: bold;
    border: 1px solid #ddd;
    border-radius: 3px 3px 0 0;
    text-align: left;
    margin: 0;
    padding: 0.5em 0.75em;
}

.sw-twig-args-table tr td {
    border: 1px solid #ddd;
    text-align: left;
    margin: 0;
    padding: 0.5em 1em;
}

.sw-twig-args-table tr th:first-child,
.sw-twig-args-table tr td:first-child {
    margin-top: 0;
}

.sw-twig-args-table tr:nth-child(2n) {
    background-color: #f8f8f8;
}
`;

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

// give a unique name for the panel
const TwigBlocksPanel = ({ api }) => {
    const state = useStorybookState();
    const storyId = state.storyId;
    const storyData = api.getData(storyId);

    if (!storyData) {
        return '';
    }

    const { parameters } = storyData;
    const { component } = parameters;
    const docGenInfo = component.__docgenInfo;
    const twigBlocks = docGenInfo.twigBlocks;

    return <div style={{ margin: '1rem' }}>
        <style>{style}</style>
        <table className="sw-twig-args-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Content</th>
                </tr>
            </thead>
            <tbody>
                { twigBlocks.map((value) => {
                    let codeHighlighter = <SyntaxHighlighter children={value.code} language={"html"} format={"true"} />

                    if (!value.code || !value.code.length) {
                        codeHighlighter = <em style={{ color: '#6f6f6f' }}>(empty block)</em>
                    }

                    return <tr key={generateId()}>
                        <td><strong>{value.name}</strong></td>
                        <td>{codeHighlighter}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </div>
};

addons.register(ADDON_ID, (api) => {
    addons.add(PANEL_ID, {
        type: types.PANEL,
        title: 'Twig blocks',
        render: ({ active, key }) => (
            <AddonPanel active={active} key={key}>
                <TwigBlocksPanel api={api} />
            </AddonPanel>
        ),
    });
});