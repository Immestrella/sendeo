import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { u } from '@cityofzion/neon-js'

import RescindButton from './RescindButton/RescindButton'
import TxId from '../../../../components/TxId/TxId'
import { GAS_ASSET_ID, NEO_ASSET_ID } from '../../../../lib/const'
import { neonGetTxInfo, neonGetTxAssets } from '../../../../lib/neonWrappers'

class OwnedEscrowListRow extends Component {
  state = {
    ownedEscrowScriptHashes: null,
    errorMsg: '',
    isLoading: true,
    previousSends: [],
  }

  componentDidMount() {
    const { contractScriptHash, net, txId } = this.props

    neonGetTxInfo(txId, contractScriptHash, net)
      .then((result) => {
        return neonGetTxAssets(u.reverseHex(txId), contractScriptHash, net)
          .then((assets) => {
            this.setState({
              note: result.note,
              created: result.created,
              spent: result.spent,
              canRescind: result.canRescind,
              assets: assets,
              isLoading: false,
            })
          })
      })
      .catch((e) => {
        this.setState({
          errorMsg: e.message,
          isLoading: false,
        })
      })
  }

  render() {
    const { note, created, spent, canRescind, assets, isLoading, errorMsg } = this.state
    const { address, contractScriptHash, net, txId } = this.props

    let rescindColumn
    if (spent) {
      rescindColumn = <div>Already claimed/rescinded</div>
    } else if (canRescind) {
      rescindColumn = <RescindButton contractScriptHash={ contractScriptHash } net={ net } address={ address } txId={ u.reverseHex(txId) } />
    } else {
      rescindColumn = <div>Not Yet</div>
    }

    if (errorMsg !== '') {
      return (
        <tr>
          <td colSpan='5' className='text-center primary'>
            ERROR: { errorMsg }
          </td>
        </tr>
      )
    } else if (isLoading) {
      return (
        <tr>
          <td colSpan='5' className='text-center primary'>
            <i className='fa fa-fw fa-spin fa-spinner' /> Checking wallet for previous sends...
          </td>
        </tr>
      )
    } else {
      return (
        <tr key={ txId }>
          <td>{created}</td>
          <td style={ { 'maxWidth': '100px', 'overflow': 'hidden' } }><TxId txId={ u.reverseHex(txId) } /></td>
          <td>
            { assets[GAS_ASSET_ID] > 0 && <div>{ assets[GAS_ASSET_ID] } GAS</div>}
            { assets[NEO_ASSET_ID] > 0 && <div>{ assets[NEO_ASSET_ID] } NEO</div>}
          </td>
          <td>{note}</td>
          <td>{rescindColumn}</td>
        </tr>
      )
    }
  }
}

OwnedEscrowListRow.propTypes = {
  contractScriptHash: PropTypes.string,
  net: PropTypes.string,
  address: PropTypes.string,
  txId: PropTypes.string,
}

export default OwnedEscrowListRow
