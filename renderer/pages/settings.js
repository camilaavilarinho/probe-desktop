import electron from 'electron'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'

import {
  Flex,
  Box,
  Heading,
  Container,
  Label,
  Checkbox,
  Text
} from 'ooni-components'

import { default as pkgJson } from '../../package.json'

const TopBar = styled.div`
  background-color: ${props => props.theme.colors.blue5};
  color: ${props => props.theme.colors.white};
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
`

const getConfigValue = (config, optionKey) => optionKey.split('.').reduce((o,i) => o[i] || false, config)

class BooleanOption extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    const {
      optionKey,
      config
    } = this.props

    const remote = electron.remote
    const { setConfig } = remote.require('./utils/config')

    const target = event.target
    const newValue = target.type === 'checkbox' ? target.checked : target.value
    const oldValue = getConfigValue(config, optionKey)
    setConfig(optionKey, oldValue, newValue).then(() => {
      this.props.onConfigSet()
    }).catch(() => {
      console.log('inconsistency detected')
      this.props.onConfigSet()
    })
  }

  render() {
    const {
      label,
      optionKey,
      config
    } = this.props


    if (config === null) {
      return <div />
    }

    const checked = getConfigValue(config, optionKey)
    return (
      <Label>
        <Checkbox checked={checked} onChange={this.handleChange} />
        {label}
      </Label>
    )
  }
}

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      config: null
    }
    this.reloadConfig = this.reloadConfig.bind(this)
  }

  reloadConfig() {
    const remote = electron.remote
    const { getConfig } = remote.require('./utils/config')

    getConfig().then(config => {
      this.setState({
        config
      })
    })
  }

  componentDidMount() {
    this.reloadConfig()
  }


  render() {
    const {
      config
    } = this.state

    return (
      <Layout>
        <Sidebar>
          <Box width={1}>
            <TopBar>
              <Flex alignItems='center'>
                <Box pl={3}>
                  <Heading h={3}><FormattedMessage id='Settings.Title' /></Heading>
                </Box>
              </Flex>
            </TopBar>
            <Container pt={3}>
              <Heading h={4}><FormattedMessage id='Settings.Sharing.Label' /></Heading>
              <BooleanOption
                onConfigSet={this.reloadConfig}
                label={<FormattedMessage id='Settings.Sharing.UploadResults' />}
                optionKey='sharing.upload_results'
                config={config} />

              <BooleanOption
                onConfigSet={this.reloadConfig}
                label={<FormattedMessage id='Settings.Sharing.IncludeNetwork' />}
                optionKey='sharing.include_asn'
                config={config} />

              <BooleanOption
                onConfigSet={this.reloadConfig}
                label={<FormattedMessage id='Settings.Sharing.IncludeCountryCode' />}
                optionKey='sharing.include_country'
                config={config} />

              <BooleanOption
                onConfigSet={this.reloadConfig}
                label={<FormattedMessage id='Settings.Sharing.IncludeIP' />}
                optionKey='sharing.include_ip'
                config={config} />
              <Text pt={3}>OONI Probe Desktop v{pkgJson.version}</Text>
            </Container>
          </Box>
        </Sidebar>
      </Layout>
    )
  }
}

export default Settings
