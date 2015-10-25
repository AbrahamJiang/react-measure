import React, { Component, PropTypes, createElement } from 'react'
import ReactDOM from 'react-dom'
import shallowCompare from 'react/lib/shallowCompare'
import { Motion, spring } from 'react-motion'
import Measure from '../src/react-measure'

class Slideable extends Component {
  state = {
    height: -1
  }
  _isAnimating = false

  componentDidMount() {
    this._node = ReactDOM.findDOMNode(this)
  }

  componentDidUpdate() {
    if(this.state.instant && !this._isAnimating) {
      this.setState({instant: false})
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const { show, children } = this.props
    const child = React.Children.only(children)
    const { style } = child.props
    const rmHeight = (show ? this.state.height : 0)

    return(
      <Measure
        config={{
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-sliding']
        }}
        accurate
        onMeasure={({height}, mutations) => {
          if (mutations) {
            const { target } = mutations[0]

            // check if the target is a child of this node
            if (this._node !== target) {
              const isSliding = target.getAttribute('data-sliding')

              // if it has finished sliding then we need to query the new height
              if (isSliding === 'false') {
                this.setState({height, instant: true})
              }
            }
          } else {
            this.setState({height})
          }
        }}
        // handle the checks above here to prevent measuring when we don't need to
        //shouldMeasure={() => !this._isAnimating}
      >
        <Motion
          defaultStyle={{height: 0}}
          style={{
            height: this.state.instant ? rmHeight : spring(rmHeight)
          }}
        >
          {({height}) => {
            const destHeight = parseFloat(this.state.height).toFixed(2)
            const currHeight = parseFloat(height).toFixed(2)
            let rmStyle = {}

            if (destHeight !== currHeight && !this.state.instant) {
              rmStyle = {
                height,
                overflow: 'hidden'
              }
            }

            if (destHeight === currHeight || height === 0) {
              this._isAnimating = false
            } else {
              this._isAnimating = true
            }

            return(
              React.cloneElement(
                React.Children.only(children),
                {
                  style: {
                    ...rmStyle,
                    ...style
                  },
                  'data-sliding': this._isAnimating
                }
              )
            )
          }}
        </Motion>
      </Measure>
    )
  }
}

export default Slideable