// @flow

import * as React from 'react'
import ResizeObserver from 'resize-observer-polyfill'

import { type Measurements, getMeasurements } from './utils'

type Props = {
  onMeasure: ({ [string]: Measurements }) => void,
  children: ({
    bind: (id: string) => { ref: (?Element) => void },
    measure: () => void,
    measurements: ?{ [string]: Measurements },
  }) => React.Node,
}

type State = {
  measurements: ?{ [string]: Measurements },
}

class Measure extends React.Component<Props, State> {
  static defaultProps = {
    onMeasure: () => {},
  }

  // prevent firing two renders when component mounts, getting measurements in bind
  // is faster than attaching a ResizeObserver and waiting for the first callback
  firstResizeEvent = true
  nodes = {}
  refsById = {}
  state = { measurements: null }

  bind = (id: string) => {
    if (!this.refsById[id]) {
      this.refsById[id] = node => {
        if (node) {
          this.nodes[id] = node
          this.resizeObserver.observe(node)
        } else {
          this.resizeObserver.unobserve(this.nodes[id])
          delete this.nodes[id]
        }
        this.setState(state => {
          const newMeasurements = { ...state.measurements }
          if (node) {
            newMeasurements[id] = getMeasurements(node)
          } else {
            delete newMeasurements[id]
          }
          return { measurements: newMeasurements }
        }, this.fireOnMeasure)
      }
    }
    return { ref: this.refsById[id] }
  }

  resizeObserver = new ResizeObserver(entries => {
    if (this.firstResizeEvent) {
      this.firstResizeEvent = false
    } else {
      this.setState(state => {
        const newMeasurements = { ...state.measurements }
        entries.forEach(entry => {
          const id = this.getIdFromNode(entry.target)
          if (id !== null && entry.target instanceof HTMLElement) {
            newMeasurements[id] = getMeasurements(entry.target)
          }
        })
        return { measurements: newMeasurements }
      }, this.fireOnMeasure)
    }
  })

  getIdFromNode = (node: Element) => {
    let id = null
    Object.keys(this.nodes).some(key => {
      if (this.nodes[key] === node) {
        return (id = key)
      }
    })
    return id
  }

  fireOnMeasure = () => {
    if (this.props.onMeasure && this.state.measurements) {
      this.props.onMeasure(this.state.measurements)
    }
  }

  measure = () => {
    this.setState(state => {
      const newMeasurements = { ...state.measurements }
      Object.keys(this.nodes).some(key => {
        newMeasurements[key] = getMeasurements(this.nodes[key])
      })
      return { measurements: newMeasurements }
    }, this.fireOnMeasure)
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect()
  }

  render() {
    return this.props.children({
      bind: this.bind,
      measure: this.measure,
      measurements: this.state.measurements,
    })
  }
}

export default Measure
