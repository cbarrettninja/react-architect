import React, { Component, PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import injectTooltip from '../Tooltips';

class TableColumn extends Component {
  constructor(props) {
    super(props);

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    numeric: PropTypes.bool,
    adjusted: PropTypes.bool,
    header: PropTypes.bool.isRequired,

    /**
     * The optional tooltip to render on hover.
     */
    tooltipLabel: PropTypes.string,

    /**
     * The position of the tooltip.
     */
    tooltipPosition: PropTypes.bool,

    /**
     * The optionally injected tooltip from the `injectTooltip` higher order component.
     */
    tooltip: PropTypes.node,
  };

  static defaultProps = {
    header: false,
  };

  render() {
    const { className, numeric, adjusted, header, children, tooltip, ...props } = this.props;

    return React.createElement(header ? 'th' : 'td', {
      className: classnames(`md-table-${header ? 'header' : 'data'}`, className, { numeric, adjusted }),
      ...props,
      children: [children, tooltip],
    });
  }
}

export default injectTooltip(TableColumn);
