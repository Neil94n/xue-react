import * as React from 'react'
import * as PropTypes from 'prop-types'
import { isSimpleArrayEqual, classes } from '../utils'
import SubMenu from './SubMenu'
import MenuItem from './MenuItem'
import './style'

interface IMenuProps {
  selectedKey?: string
  expandKeys?: string[]
  defaultSelectedKey?: string
  defaultExpandKeys?: string[]
  mode?: 'vertical' | 'horizontal'
  theme?: 'light' | 'dark'
  onSelectedChange?: (key: string, expand: string[]) => any
  onExpandChange?: (expand: string[]) => any
  className?: string
  style?: React.CSSProperties
}

interface IMenuState {
  derivedSelectedKey: string
  derivedExpandKeys: string[]
}

interface IChildProps {
  uniqueKey?: string
  selectedKey?: string
  expandKeys?: string[]
  title: string | React.ReactNode
  handleSelectedKey?: (key: string) => any
  handleExpandKeys?: (key: string) => any
  className?: string
  style?: React.CSSProperties
  mode?: 'vertical' | 'horizontal'
  theme?: 'light' | 'dark'
}

const componentName = 'Menu'

class Menu extends React.Component<IMenuProps, IMenuState> {
  public static displayName = componentName

  public static SubMenu: typeof SubMenu = SubMenu
  public static MenuItem: typeof MenuItem = MenuItem

  public static propTypes = {
    selectedKey: PropTypes.string,
    expandKeys: PropTypes.arrayOf(PropTypes.string),
    defaultSelectedKey: PropTypes.string,
    defaultExpandKeys: PropTypes.arrayOf(PropTypes.string),
    mode: PropTypes.oneOf(['vertical', 'horizontal']),
    theme: PropTypes.oneOf(['light', 'dark']),
    onSelectedChange: PropTypes.func,
    onExpandChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object
  }

  public static defaultProps = {
    mode: 'vertical',
    theme: 'light'
  }

  public static getDerivedStateFromProps(
    nextProps: IMenuProps,
    prevState: IMenuState
  ) {
    const { selectedKey, expandKeys } = nextProps
    const { derivedSelectedKey, derivedExpandKeys } = prevState
    const shouldChangeSelectedKey =
      'selectedKey' in nextProps && selectedKey !== derivedSelectedKey
    const shouldChangeExpandKeys =
      'expandKeys' in nextProps &&
      !isSimpleArrayEqual(expandKeys as string[], derivedExpandKeys)
    if (shouldChangeSelectedKey && shouldChangeExpandKeys) {
      return { derivedSelectedKey: selectedKey, derivedExpandKeys: expandKeys }
    } else if (shouldChangeSelectedKey && !shouldChangeExpandKeys) {
      return { derivedSelectedKey: selectedKey }
    } else if (!shouldChangeSelectedKey && shouldChangeExpandKeys) {
      return { derivedExpandKeys: expandKeys }
    }
    return null
  }

  constructor(props: IMenuProps) {
    super(props)
    const { defaultSelectedKey, defaultExpandKeys } = props
    this.state = {
      derivedSelectedKey: ('defaultSelectedKey' in props
        ? defaultSelectedKey
        : '') as string ,
      derivedExpandKeys: ('defaultExpandKeys' in props
        ? defaultExpandKeys
        : []) as string[]
    }
  }

  public renderChildren = (): Array<React.ReactElement<IChildProps>> => {
    const { handleSelectedKey, handleExpandKeys } = this
    const { mode, theme, children } = this.props
    const { derivedSelectedKey, derivedExpandKeys } = this.state
    return React.Children.map(
      children,
      (child: React.ReactElement<IChildProps>, index: number) => {
        const uniqueKey = this.getUniqueKeyFromChild(child, index)
        return React.cloneElement(child, {
          uniqueKey,
          selectedKey: derivedSelectedKey,
          expandKeys: derivedExpandKeys,
          handleSelectedKey,
          handleExpandKeys,
          mode,
          theme
        })
      }
    )
  }

  public getUniqueKeyFromChild = (
    child: React.ReactElement<IChildProps>,
    index: number
  ): string => {
    return (child.key as string) || `item-${index}`
  }

  public handleSelectedKey = (key: string) => {
    const { onSelectedChange, mode } = this.props
    const { derivedSelectedKey, derivedExpandKeys } = this.state
    if (mode === 'vertical') {
      if (key !== derivedSelectedKey) {
        this.setState({ derivedSelectedKey: key })
        if (onSelectedChange) {
          onSelectedChange(key, derivedExpandKeys)
        }
      }
    } else if (mode === 'horizontal') {
      if (key !== derivedSelectedKey) {
        this.setState({ derivedSelectedKey: key, derivedExpandKeys: [] })
        if (onSelectedChange) {
          onSelectedChange(key, [])
        }
      }
    }
  }

  public handleExpandKeys = (key: string) => {
    const newExpandKeys = this.getNewExpandKeys(key)
    this.setState({ derivedExpandKeys: newExpandKeys })
    if (this.props.onExpandChange) {
      this.props.onExpandChange(newExpandKeys)
    }
  }

  public getNewExpandKeys = (key: string): string[] => {
    const { derivedExpandKeys } = this.state
    return derivedExpandKeys.indexOf(key) > -1
      ? derivedExpandKeys.filter(item => item !== key)
      : [key, ...derivedExpandKeys]
  }

  public render() {
    const cn = componentName
    const { className, style, mode, theme } = this.props
    return (
      <ul className={classes(cn, '', [className, mode, theme])} style={style}>
        {this.renderChildren()}
      </ul>
    )
  }
}

export default Menu
