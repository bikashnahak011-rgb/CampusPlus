import { CalendarDays, ChefHat } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MEAL_SLOTS, MESS_DAYS } from '../data/messMenuConfig'

function getWeekDate(dayIndex) {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const date = new Date(today)
  date.setDate(today.getDate() - mondayOffset + dayIndex)
  return date
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMealItems(value) {
  if (typeof value !== 'string' || !value.trim()) return []
  return value.split(/\s*\+\s*|\s*,\s*/).map(item => item.trim()).filter(Boolean)
}

export default function MessMenuWeek({ menus, activeDay, onSelectDay }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const weekStart = getWeekDate(0)
  const weekEnd = getWeekDate(6)
  const weekBoardRef = useRef(null)

  useEffect(() => {
    weekBoardRef.current
      ?.querySelector(`[data-mess-day="${activeDay}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }, [activeDay])

  return (
    <section className="mess-week-panel" aria-label="Weekly mess menu">
      <header className="mess-week-banner">
        <div className="mess-week-brand">
          <span className="mess-week-chef-icon"><ChefHat size={28} /></span>
          <div>
            <h2>Mess Menu</h2>
            <p>Good food <span>•</span> Healthy you <span>•</span> Every day</p>
          </div>
        </div>
        <p className="mess-week-motto">Fresh meals<br />for a better tomorrow</p>
        <div className="mess-week-range">
          <CalendarDays size={20} />
          <div><strong>This week</strong><span>{formatDate(weekStart)} – {formatDate(weekEnd)}</span></div>
        </div>
      </header>

      <div className="mess-week-scroll" role="list" aria-label="Menu by day" ref={weekBoardRef}>
        {MESS_DAYS.map((day, index) => {
          const menu = menus?.[day]
          const isSelected = activeDay === day
          const isToday = today === day
          const date = getWeekDate(index)

          return (
            <article
              key={day}
              className={`mess-day-card mess-day-card--${index % 7}${isSelected ? ' is-selected' : ''}`}
              data-mess-day={day}
              role="listitem"
              aria-current={isToday ? 'date' : undefined}
            >
              <button
                type="button"
                className="mess-day-heading"
                onClick={() => onSelectDay(day)}
                aria-pressed={isSelected}
              >
                <span className="mess-day-name">{day}</span>
                <span className="mess-day-date">{formatDate(date)}{isToday ? ' · Today' : ''}</span>
              </button>
              <div className="mess-day-meals">
                {MEAL_SLOTS.map(meal => {
                  const items = formatMealItems(menu?.[meal.key])
                  return (
                    <section key={meal.key} className={`mess-meal-block mess-meal-block--${meal.color}`}>
                      <div className="mess-meal-heading">
                        <span aria-hidden="true">{meal.emoji}</span>
                        <span>{meal.label}</span>
                      </div>
                      {items.length ? (
                        <>
                          <ul className="mess-meal-items">
                            {items.map((item, itemIndex) => <li key={`${meal.key}-${itemIndex}`}>{item}</li>)}
                          </ul>
                          <span className="mess-meal-art" aria-hidden="true">{meal.icon}</span>
                        </>
                      ) : <p className="mess-meal-empty">Menu not published</p>}
                    </section>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>

      <footer className="mess-routine-strip" aria-label="Meal timings">
        <div className="mess-routine-intro">
          <span className="mess-routine-calendar"><CalendarDays size={19} /></span>
          <span><strong>Your daily routine</strong><small>Healthy food for a focused day</small></span>
        </div>
        {MEAL_SLOTS.map(meal => (
          <div key={meal.key} className={`mess-routine-item mess-routine-item--${meal.color}`}>
            <span aria-hidden="true">{meal.emoji}</span>
            <span><strong>{meal.label}</strong><small>{meal.time}</small></span>
          </div>
        ))}
      </footer>
    </section>
  )
}
