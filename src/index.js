import './styles.css';
import { solve } from './solver';
import { times } from './data';
import { configuration as config } from './configuration';

/**
 * Moves the lift to the destination point using the shortest path.
 */
window.go = () => {
  let path = solve(
    times,
    { floor: window.currentFloor.value, room: window.currentRoom.value },
    { floor: window.nextFloor.value, room: window.nextRoom.value }
  );

  if (path.length) {
    window.currentFloor.value = window.nextFloor.value
    window.currentRoom.value = window.nextRoom.value

    moveLift(path);
  }
};

/**
 * Moves the lift through the path.
 * 
 * @param {Object[]} path The path in the format [{floor:srcN,room:srcN},..{floor:destN,room:destN}].
 */
function moveLift (path) {
  let rooms = times.slice().reverse();
  let liftEl = document.querySelector('.lift');

  toggleLiftDoor(liftEl, () => {
    toggleLiftDoor(liftEl, () => {
      delayBeforeLiftMoves(() => {
        let nextPath = path.shift() && path;
        
        if (nextPath.length) {
          moveLiftNextStep(path, rooms, liftEl);
        }
      });
    });
  });
};

/**
 * Moves the lift one step forward.
 * 
 * @param {Object[]} path The path in the format [{floor:srcN,room:srcN},..{floor:destN,room:destN}].
 * @param {number[][]} rooms The array of floors and rooms.
 * @param {Object} liftEl The lift's DOM element.
 */
function moveLiftNextStep (path, rooms, liftEl) {
  if (!path.length) {
    toggleLiftDoor(liftEl, () => {
      toggleLiftDoor(liftEl);
    });

    return; 
  }

  let nextRoom = path.shift();
  let floor = nextRoom.floor;
  let room = nextRoom.room;
  let time = rooms[floor][room];

  liftEl.style.transitionDuration = time + 'ms';
  liftEl.style.left = (config.ROOM_WIDTH * room) + 'px';
  liftEl.style.bottom = (config.ROOM_HEIGHT * floor) + 'px';

  setTimeout(() => {
    moveLiftNextStep(path, rooms, liftEl);
  }, time);
};

/**
 * Opens or closes the lift's door.
 * 
 * @param {Object} liftEl The lift's DOM element.
 * @param {Function} callback The callback that is called when the door's been opened/closed.
 */
function toggleLiftDoor (liftEl, callback = () => { }) {
  setTimeout(() => {
    liftEl.classList.toggle('open');
    callback();
  }, config.TOGGLE_LIFT_DOOR_TIME);
};

/**
 * A soft of delay before the lift starts to move. 
 * It's a real "made in china" lift ;)
 * 
 * @param {Function} callback The callback that is called after the delay.
 */
function delayBeforeLiftMoves (callback) {
  setTimeout(() => {
    callback();
  }, config.DELAY_BEFORE_LIFT_MOVES);
};

/**
 * Builds a house in the DOM.
 */
function buildHouse () {
  let floors = times.slice().reverse();
  let floorsCount = floors.length;
  let roomsPerFloorCount = floorsCount ? floors[0].length : 0;

  let houseEl = document.querySelector('.house');
  let floorsEl = document.querySelector('.floors');

  houseEl.style.width = 
    (roomsPerFloorCount * config.ROOM_WIDTH + config.HOUSE_GUTTER) + 'px';
  houseEl.style.height = 
    (floorsCount * config.ROOM_HEIGHT + config.HOUSE_GUTTER) + 'px';

  floors.forEach((floor, floorIndex) => {
    let bottomPosition = config.ROOM_HEIGHT * floorIndex;   

    floor.forEach((room, roomIndex) => {
      let leftPosition = config.ROOM_WIDTH * roomIndex;

      let roomEl = document.createElement('div');
      roomEl.classList.add('window');
      roomEl.style.bottom = bottomPosition + 'px';
      roomEl.style.left = leftPosition + 'px';

      // let's turn the light on in some rooms
      if (Math.round(Math.random())) {
        roomEl.classList.add('light');
      }

      if (!room) {
        roomEl.style.opacity = 0;
      }

      floorsEl.appendChild(roomEl);
    });
  });
}

buildHouse();
