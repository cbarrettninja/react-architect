import React, { PureComponent, cloneElement, Children } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';

import { TAB } from '../constants/keyCodes';
import handleWindowClickListeners from '../utils/EventUtils/handleWindowClickListeners';
import ResizeObserver from '../Helpers/ResizeObserver';

/**
 * The `ExpansionList` component is a wrapper for the `ExpansionPanel` that helps
 * determine which `ExpansionPanel` currently has tab focus and adjusts the column
 * sizes in the header of the `ExpansionPanel`.
 *
 * The `ExpansionList` and `ExpansionPanel` components should have probably been
 * implemented as a `table` insead of a `ul || ol` since it is more column based,
 * but it would complicate the API to have dynamic row generation for the expanded
 * panels. The expanded panels _might_ not follow the same column widths as their labels
 * so a singular row with a div for expanded content might not work correctly.
 */
export default class ExpansionList extends PureComponent {
  static propTypes = {
    /**
     * An optional style object to apply to the list.
     */
    style: PropTypes.object,

    /**
     * An optional className to apply to the list.
     */
    className: PropTypes.string,

    /**
     * The children should be a list or singular `ExpansionPanel` component
     * to render with some additional props injected.
     */
    children: PropTypes.node,

    /**
     * The component to render the list as.
     */
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]).isRequired,

    recalculateThreshold: PropTypes.number.isRequired,
  };

  static defaultProps = {
    component: 'ul',
    recalculateThreshold: 80,
  };

  constructor(props) {
    super(props);

    this.state = { columnWidths: [], focusedIndex: -1, overflow: false };

    this._setContainer = this._setContainer.bind(this);
    this._removeFocus = this._removeFocus.bind(this);
    this._calcColumnWidths = this._calcColumnWidths.bind(this);
    this._determineTabFocus = this._determineTabFocus.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.children !== nextProps.children) {
      this._calcColumnWidths();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { focusedIndex } = this.state;
    if (prevState.focusedIndex === focusedIndex || (prevState.focusedIndex > -1 && focusedIndex > -1)) {
      return;
    }

    handleWindowClickListeners(this._removeFocus, this.state.focusedIndex !== -1);
  }

  componentWillUnmount() {
    if (this.state.focusedIndex === -1) {
      handleWindowClickListeners(this._removeFocus, false);
    }

    window.removeEventListener('keyup', this._determineTabFocus);
  }

  _setContainer(container) {
    if (container !== null) {
      this._container = findDOMNode(container);
      window.addEventListener('keyup', this._determineTabFocus);

      this._width = this._container.offsetWidth;
      this._calcColumnWidths();
    }
  }

  _determineTabFocus(e) {
    if ((e.which || e.keyCode) === TAB) {
      const panels = Array.prototype.slice.call(findDOMNode(this).querySelectorAll('.md-panel-header'));
      this.setState({ focusedIndex: panels.indexOf(e.target) });
    }
  }

  _removeFocus() {
    this.setState({ focusedIndex: -1 });
  }

  _isOverflown = (widths) => {
    if (!this._container) {
      return 0;
    }

    const panel = this._container.querySelector('.md-panel-header');
    if (!panel) {
      return 0;
    }

    const collapser = this._container.querySelector('.md-expansion-panel__collapser');
    const collapserWidth = collapser ? collapser.offsetWidth : 0;
    const styles = window.getComputedStyle(panel);
    const maxWidth = panel.offsetWidth
      - parseFloat(styles.paddingLeft)
      - parseFloat(styles.paddingRight)
      - collapserWidth;

    const totalWidth = widths.reduce((total, w) => total + w, 0);
    return totalWidth > maxWidth;
  };

  /**
   * Since this should really be rendered as a table, need to calculate the max width for each _column_
   * on the panel's header and apply that as a min width for the other panels.
   */
  _getColumnWidths = () => {
    if (!this._container) {
      return this.state.columnWidths;
    }

    return [].slice.call(this._container.querySelectorAll('.md-panel-header'))
      .reduce((maxes, row) => {
        const columns = row.querySelectorAll('.md-panel-column');
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          // Need to reset the widths if it has already been calculated to get a more accurate measurement.
          const { width, minWidth } = col.style;
          col.style.width = 'auto';
          col.style.minWidth = 'auto';

          // Only need to include the offsetWidth of the column because the child will really
          // determine the width of the column. Since it has already been defined at this point,
          // no additional work needs to be done.
          maxes[i] = Math.max(col.offsetWidth, maxes[i] || 0);
          col.style.width = width;
          col.style.minWidth = minWidth;
        }

        return maxes;
      }, [0]);
  };

  _calcColumnWidths = () => {
    const { columnWidths } = this.state;
    const nextWidths = this._getColumnWidths();
    const overflown = this._isOverflown(nextWidths);
    if (this.state.overflown !== overflown
      || columnWidths.length !== nextWidths.length
      || nextWidths.some((w, i) => w !== columnWidths[i])
    ) {
      this.setState({ columnWidths: nextWidths, overflown });
    }
  };

  _handleResize = ({ width }) => {
    const { recalculateThreshold } = this.props;
    if (this._width !== width && (Math.abs(width - this._width) >= recalculateThreshold)) {
      this._width = width;
      this._calcColumnWidths();
    }
  }

  render() {
    const { columnWidths, focusedIndex, overflown } = this.state;
    const {
      children,
      className,
      component: Component,
      recalculateThreshold, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    const panels = Children.map(children, (child, i) => cloneElement(child, {
      key: child.key || i,
      overflown,
      columnWidths,
      focused: focusedIndex === i,
    }));
    return (
      <Component
        {...props}
        ref={this._setContainer}
        className={cn('md-expansion-panel-list', className)}
      >
        <ResizeObserver watchWidth onResize={this._handleResize} />
        {panels}
      </Component>
    );
  }
}
