import GeneralGUI from './general-gui'

const TOUR_STORAGE_KEY = 'beckerbox_tour_seen'

const driver = new window.driver.js.driver({
  opacity: 0.65,
  padding: 8,
  allowClose: false,
  doneBtnText: 'Done',
  nextBtnText: 'Next',
  prevBtnText: 'Back',
  animate: true,
  keyboardControl: false,
})

const steps = [
  {
    popover: {
      title: 'Welcome to BeckerBox Remote!',
      description:
        "Since this is your first time, let's go through some of the basics so you know how to make the most out of your experience.",
    },
  },
  { element: '#RemotePage', popover: { title: 'Your Remote', description: 'This is where you push buttons. Yay! (Pretty self explanatory)' } },
  { popover: { title: 'Point at the screen', description: 'By pointing your remote at the screen, you should be able to see your pointer appear.' } },
  {
    element: '#menuBarsBtn',
    popover: {
      title: 'All other options',
      description: 'Since you will be using the remote itself most of the time, all other options are inside this menu.',
    },
  },
  {
    element: '#side-menu .menu-content',
    popover: {
      title: 'Some Options Player 1 only',
      description: "Certain options are only for player 1. If the button is faded, that means that you're not player 1, so you don't have access to use that button.",
      onPopoverRender: () => window.remote.GUI.openMenu(),
    },
  },
  {
    element: '#PowerOffBtn',
    popover: {
      title: 'Power off',
      description:
        'This is how you turn off the system. It will simulate the console shutting down and close BeckerBox. (It will not shut down the whole computer.) Note: this button will only work when you are on the console system menu.',
    },
  },
  { element: '#reconnectBtn', popover: { title: 'Reconnect', description: 'If BeckerBox remote is ever acting weird, push this button to refresh the connection.' } },
  {
    element: '#disconnectBtn',
    popover: { title: 'Disconnect', description: "This will disconnect your phone from the console. Use this if you're done or want a friend to take your place. (You will automatically be disconnected when the console turns off.)" },
  },
  {
    element: '#changeDiscBtn',
    popover: { title: 'Change/Insert Disc', description: 'Real consoles require a disc. Click this button, then select your game. Note: only works in the console system menu.' },
  },
  {
    element: '#changeLayoutBtn',
    popover: { title: 'Remote layouts', description: "Sometimes, the standard remote layout just isn't best. There are 3 remote layouts. Let's go over them quickly." },
  },
  {
    element: '#RemotePage',
    popover: {
      title: 'Classic Layout',
      description: 'Default layout. Works for most games with lots of pointing and movement.',
      onPopoverRender: () => window.remote.GUI.closeMenu(),
    },
  },
  {
    element: '#RemotePage',
    popover: { title: 'Driver Layout', description: 'Best for driving games — larger 1/2 buttons and a joystick overlay on the dpad.', onPopoverRender: () => window.remote.GUI.changeLayout('driver') },
  },
  {
    element: '#RemotePage',
    popover: { title: 'Split Layout', description: 'Some games require an extension (joystick/Z/C). Use this to enable the extension features.', onPopoverRender: () => window.remote.GUI.changeLayout('split') },
  },
  {
    element: '#handDominanceBtn',
    popover: {
      title: 'Hand Dominance',
      description: 'Are you left handed? Click this option and the B button will switch sides. Note: no effect on Split layout.',
      side: 'top',
      onPopoverRender: () => {
        window.remote.GUI.changeLayout('classic')
        window.remote.GUI.openMenu()
      },
    },
  },
  {
    element: '#moreOptionsBtn',
    popover: {
      title: 'More Options',
      description: 'You will probably never need this, but there are more options in here :)',
      onPopoverRender: () => {
        window.remote.GUI.changeLayout('classic')
        window.remote.GUI.openMenu()
      },
    },
  },
  { element: '#joinCode', popover: { title: 'Join QR Code', description: 'If someone wants to join, have them scan this code using their phone. No difference if they scan the code on the BeckerBox main menu on the computer.' } },
  {
    popover: {
      title: "You're ready!",
      description: 'Have a great time. I really hope you enjoy it!',
      onPopoverRender: () => {
        window.remote.GUI.changeLayout('classic')
        window.remote.GUI.closeMenu()
        localStorage.setItem(TOUR_STORAGE_KEY, 'true')
      },
    },
  },
]

driver.setSteps(steps)

export async function startBeckerboxTour(force = false) {
  return
  if (!force && localStorage.getItem(TOUR_STORAGE_KEY)) return

  await GeneralGUI.waitForFullscreenLaunch()

  window.remote.GUI.changeLayout('classic')
  window.remote.GUI.closeMenu()
  driver.drive()
}
