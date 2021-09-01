"use strict";

var _react = _interopRequireDefault(require("react"));

var _crypto = _interopRequireDefault(require("crypto"));

var _addons = require("@storybook/addons");

var _api = require("@storybook/api");

var _components = require("@storybook/components");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ADDON_ID = 'sw-twig-blocks';
var PANEL_ID = "".concat(ADDON_ID, "/panel");
var style = "\n.sw-twig-args-table {\n    font-size: 13px;\n    line-height: 20px;\n    padding: 0;\n    border-collapse: collapse;\n    width: 100%;\n    margin: 2em 0;\n    overflow: auto;\n}\n\n.sw-twig-args-table tr {\n    border-top: 1px solid #eee;\n    background-color: #fff;\n    margin: 0px;\n    padding: 0px;\n}\n\n.sw-twig-args-table tr th {\n    font-weight: bold;\n    border: 1px solid #ddd;\n    border-radius: 3px 3px 0 0;\n    text-align: left;\n    margin: 0;\n    padding: 0.5em 0.75em;\n}\n\n.sw-twig-args-table tr td {\n    border: 1px solid #ddd;\n    text-align: left;\n    margin: 0;\n    padding: 0.5em 1em;\n}\n\n.sw-twig-args-table tr th:first-child,\n.sw-twig-args-table tr td:first-child {\n    margin-top: 0;\n}\n\n.sw-twig-args-table tr:nth-child(2n) {\n    background-color: #f8f8f8;\n}\n";

function generateId() {
  return _crypto["default"].randomBytes(16).toString('hex');
} // give a unique name for the panel


var TwigBlocksPanel = function TwigBlocksPanel(_ref) {
  var api = _ref.api;
  var state = (0, _api.useStorybookState)();
  var storyId = state.storyId;
  var storyData = api.getData(storyId);

  if (!storyData) {
    return '';
  }

  var parameters = storyData.parameters;
  var component = parameters.component;
  var docGenInfo = component.__docgenInfo;
  var twigBlocks = docGenInfo.twigBlocks;
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      margin: '1rem'
    }
  }, /*#__PURE__*/_react["default"].createElement("style", null, style), /*#__PURE__*/_react["default"].createElement("table", {
    className: "sw-twig-args-table"
  }, /*#__PURE__*/_react["default"].createElement("thead", null, /*#__PURE__*/_react["default"].createElement("tr", null, /*#__PURE__*/_react["default"].createElement("th", null, "Name"), /*#__PURE__*/_react["default"].createElement("th", null, "Content"))), /*#__PURE__*/_react["default"].createElement("tbody", null, twigBlocks.map(function (value) {
    var codeHighlighter = /*#__PURE__*/_react["default"].createElement(_components.SyntaxHighlighter, {
      children: value.code,
      language: "html",
      format: "true"
    });

    if (!value.code || !value.code.length) {
      codeHighlighter = /*#__PURE__*/_react["default"].createElement("em", {
        style: {
          color: '#6f6f6f'
        }
      }, "(empty block)");
    }

    return /*#__PURE__*/_react["default"].createElement("tr", {
      key: generateId()
    }, /*#__PURE__*/_react["default"].createElement("td", null, /*#__PURE__*/_react["default"].createElement("strong", null, value.name)), /*#__PURE__*/_react["default"].createElement("td", null, codeHighlighter));
  }))));
};

_addons.addons.register(ADDON_ID, function (api) {
  _addons.addons.add(PANEL_ID, {
    type: _addons.types.PANEL,
    title: 'Twig blocks',
    render: function render(_ref2) {
      var active = _ref2.active,
          key = _ref2.key;
      return /*#__PURE__*/_react["default"].createElement(_components.AddonPanel, {
        active: active,
        key: key
      }, /*#__PURE__*/_react["default"].createElement(TwigBlocksPanel, {
        api: api
      }));
    }
  });
});