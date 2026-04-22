import { onMount, type Component } from 'solid-js'
import { initializeGeneralGUIState } from './general-gui'

const icon = (name: string, style?: any, base: string = 'fa-solid') => <i class={`${base} ${name}`} style={style}></i>

const LayoutOne: Component = () => (
  <remote class="layout-1">
    <div data-key="Home" class="btn">{icon('fa-house')}</div>
    <div class="volumeBtns left">
      <div data-key="Plus" class="btn">{icon('fa-plus')}</div>
      <div data-key="Minus" class="btn">{icon('fa-minus')}</div>
    </div>
    <div class="volumeBtns right">
      <div data-key="Plus" class="btn">{icon('fa-plus')}</div>
      <div data-key="Minus" class="btn">{icon('fa-minus')}</div>
    </div>

    <div class="bTri one">
      <div data-key="B" class="btn" id="bBtn1"></div>
      <div class="text">B</div>
    </div>
    <div class="bTri two">
      <div data-key="B" class="btn" id="bBtn2"></div>
      <div class="text">B</div>
    </div>

    <div class="dpad">
      <div></div>
      <div data-key="PadN" class="btn">{icon('fa-caret-up')}</div>
      <div></div>
      <div data-key="PadW" class="btn">{icon('fa-caret-left')}</div>
      <div class="ctr"></div>
      <div data-key="PadE" class="btn">{icon('fa-caret-right')}</div>
      <div></div>
      <div data-key="PadS" class="btn">{icon('fa-caret-down')}</div>
      <div></div>
    </div>

    <div data-key="A" class="btn">A</div>

    <div class="numBtns">
      <div data-key="One" class="btn">1</div>
      <div data-key="Two" class="btn">2</div>
    </div>
  </remote>
)

const LayoutTwo: Component = () => (
  <remote class="layout-2">
    <div data-key="Home" class="btn">{icon('fa-house')}</div>
    <div class="volumeBtns left">
      <div data-key="Plus" class="btn">{icon('fa-plus')}</div>
      <div data-key="Minus" class="btn">{icon('fa-minus')}</div>
    </div>
    <div class="volumeBtns right">
      <div data-key="Plus" class="btn">{icon('fa-plus')}</div>
      <div data-key="Minus" class="btn">{icon('fa-minus')}</div>
    </div>

    <div class="bTri one">
      <div data-key="B" class="btn" id="bBtn1"></div>
      <div class="text">B</div>
    </div>
    <div class="bTri two">
      <div data-key="B" class="btn" id="bBtn2"></div>
      <div class="text">B</div>
    </div>

    <div class="dpad">
      <div></div>
      <div data-key="PadN" class="btn">{icon('fa-caret-up')}</div>
      <div></div>
      <div data-key="PadW" class="btn">{icon('fa-caret-left')}</div>
      <div class="ctr"></div>
      <div data-key="PadE" class="btn">{icon('fa-caret-right')}</div>
      <div></div>
      <div data-key="PadS" class="btn">{icon('fa-caret-down')}</div>
      <div></div>
    </div>

    <div data-key="A" class="btn">A</div>

    <div class="numBtns">
      <div data-key="One" class="btn">1</div>
      <div data-key="Two" class="btn">2</div>
    </div>
  </remote>
)

const LayoutThree: Component = () => (
  <remote class="layout-3">
    <div class="remote-container nunchuck">
      <div class="label">Extension</div>
      <div class="column">
        <div data-key="C" class="btn">C</div>
        <div data-key="Z" class="btn">Z</div>
      </div>
      <div class="column">
        <div class="joystick"></div>
        <div data-key="NunX" class="btn" data-dispatches-events="true" style="display: none;"></div>
        <div data-key="NunY" class="btn" data-dispatches-events="true" style="display: none;"></div>
      </div>
    </div>

    <div class="homeRow">
      <div data-key="Minus" class="btn">{icon('fa-minus')}</div>
      <div data-key="Home" class="btn">{icon('fa-house')}</div>
      <div data-key="Plus" class="btn">{icon('fa-plus')}</div>
    </div>

    <div class="remote-container wiiMote">
      <div class="label">Controller</div>
      <div class="column">
        <div class="numBtns">
          <div data-key="One" class="btn">1</div>
          <div data-key="Two" class="btn">2</div>
        </div>
        <div data-key="B" class="btn">B</div>
      </div>
      <div class="column">
        <div class="dpad">
          <div></div>
          <div data-key="PadN" class="btn">{icon('fa-caret-up')}</div>
          <div></div>
          <div data-key="PadW" class="btn">{icon('fa-caret-left')}</div>
          <div class="ctr"></div>
          <div data-key="PadE" class="btn">{icon('fa-caret-right')}</div>
          <div></div>
          <div data-key="PadS" class="btn">{icon('fa-caret-down')}</div>
          <div></div>
        </div>
        <div data-key="A" class="btn">A</div>
      </div>
    </div>
  </remote>
)

const App: Component = () => {
  onMount(() => {
    initializeGeneralGUIState()
  })

  return (
    <>
      <section id="openFullScreenPrompt">
        <button id="launchFullscreenBtn" class="wiiUIbtn">
          Launch
          <br />
          BeckerBox
          <br />
          Remote
        </button>
      </section>

      <section id="connectPage">
        <div style="text-align: center;">
          <h1 style="font-size: 45px; margin-top: 50px; margin-bottom: 10px;">BeckerBox<br />Remote</h1>
          <p id="connectingText" style="margin-top: 40px; font-size: 20px;">
            Connecting to BeckerBox host
            <br />
            <br />
            Please wait...
          </p>
          <div style="height: 50px;"></div>
        </div>
      </section>

      <section id="RemotePage" style="display: none;">
        <div id="side-menu" class="closed">
          <div class="screen-dimmer" onClick={(e) => e.currentTarget.parentElement?.classList.add('closed')}></div>
          <div class="menu-content">
            <div class="menu-btn player-one-only" id="PowerOffBtn" style="transform: translateY(-0.5rem);">
              {icon('fa-power-off', { color: 'red' })} Power Off
            </div>
            <div class="title">BeckerBox<br />Remote</div>
            <hr />
            <div class="menu-btn" id="reconnectBtn" onClick={() => window.refreshConnection(true)}>
              {icon('fa-link')} Reconnect
            </div>
            <div class="menu-btn" id="disconnectBtn" onClick={() => window.disconnectRemote()}>
              {icon('fa-link-slash')} Disconnect
            </div>
            <div class="menu-btn player-one-only" id="changeDiscBtn">
              {icon('fa-eject')} Change Disc
            </div>
            <div class="menu-btn" id="changeLayoutBtn"></div>
            <div class="menu-btn" id="handDominanceBtn"></div>
            <div class="menu-btn" id="moreOptionsBtn">
              {icon('fa-gears')} More Options
            </div>
            <div class={`menu-btn ${!navigator.bluetooth ? 'disabled' : ''}`} id="connectBluetoothBtn">
            </div>
            <div id="joinCode">
              <div class="text">Join Code</div>
              <div class="qr-code"></div>
            </div>
          </div>
        </div>

        <div class="top-nav">
          <div id="menuBarsBtn">{icon('fa-sliders', { opacity: 0.6 })}</div>
        </div>

        <div data-key="Nun" class="btn" data-dispatches-events="true" style="display: none;"></div>

        <LayoutOne />
        <LayoutTwo />
        <LayoutThree />

        <div id="lights">
          <div id="light1"></div>
          <div id="light2"></div>
          <div id="light3"></div>
          <div id="light4"></div>
        </div>
      </section>
    </>
  )
}

export default App
