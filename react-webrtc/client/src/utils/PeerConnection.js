import Emitter from './Emitter'
import MediaDevice from './MediaDevice'
import socket from './socket'

const CONFIG = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

class PeerConnection extends Emitter {
  constructor(remoteId) {
    super()
    this.remoteId = remoteId

    this.pc = new RTCPeerConnection(CONFIG)
    this.pc.onicecandidate = ({ candidate }) => {
      socket.emit('call', {
        to: this.remoteId,
        candidate
      })
    }
    this.pc.ontrack = ({ streams }) => {
      this.emit('remoteStream', streams[0])
    }

    this.mediaDevice = new MediaDevice()
    this.getDescription = this.getDescription.bind(this)
  }

  start(isCaller, config) {
    this.mediaDevice
      .on('stream', (stream) => {
        stream.getTracks().forEach((t) => {
          this.pc.addTrack(t, stream)
        })

        this.emit('localStream', stream)

        isCaller
          ? socket.emit('request', { to: this.remoteId })
          : this.createOffer()
      })
      .start(config)

    return this
  }

  stop(isCaller) {
    if (isCaller) {
      socket.emit('end', { to: this.remoteId })
    }
    this.mediaDevice.stop()
    this.pc.restartIce()
    this.off()

    return this
  }

  createOffer() {
    this.pc.createOffer().then(this.getDescription).catch(console.error)

    return this
  }

  createAnswer() {
    this.pc.createAnswer().then(this.getDescription).catch(console.error)

    return this
  }

  getDescription(desc) {
    this.pc.setLocalDescription(desc)

    socket.emit('call', { to: this.remoteId, sdp: desc })

    return this
  }

  setRemoteDescription(desc) {
    this.pc.setRemoteDescription(new RTCSessionDescription(desc))

    return this
  }

  addIceCandidate(candidate) {
    if (candidate) {
      this.pc.addIceCandidate(new RTCIceCandidate(candidate))
    }

    return this
  }
}

export default PeerConnection
