(($) ->
  $.fn.acSelect = (options) ->

    # Init data and unique naming (for multiple acSelects)
    select = @
    acName = select.attr('id')
    acSelectData = "#{acName}_data"
    acContainer = select.parent().attr('id', "ac-container-#{acName}")
    data = {}
    data[acSelectData] = []

    # Hide select & add input field
    if select.is('input')
      select.addClass "#{acName}-input"
    else
      select.hide()
      acContainer.append("<input type='text' placeholder='Search any term...' class='#{acName}-input'>")

    # Sort data
    sortDataByLabel = (data) ->
      data.sort (a, b) ->
        if (a.label < b.label)
          return -1
        if (a.label > b.label)
          return 1
        return 0

    # Add label attribute for autocomplete
    addLabel = (acData, label) ->
      $.map acData, (item) ->
        $.extend(item, {label: item[label]})
      return acData

    loadData = (select) ->
      $(select.find('option').not(':selected')).each (index, item) ->
        newItem = {}
        newItem['id'] = $(item).val()
        newItem['label'] = $(item).text()
        newItem['image'] = $(item).data('image')
        data[acSelectData].push(newItem)
      data[acSelectData]

    # Establish default settings
    settings = $.extend(
      acLabel: 'label'
      acImage: 'image'
      acSelectData: loadData(@)
      acPreSelectData: null
    , options)

    # Load data & sort data by label
    data[acSelectData] = settings.acSelectData
    if settings.acLabel != 'label'
      data[acSelectData] = addLabel(data[acSelectData], settings.acLabel)
    data[acSelectData] = sortDataByLabel(data[acSelectData])

    acSelectedItemHtml = (item) ->
      "<li class='ac-item' id=\"ac-item-#{item.id}\" data-id=#{item.id}>
        <a>
          #{if item[settings.acImage] then "<img src=#{item[settings.acImage]}>" else ''}
          <span class='ac-item-label'>#{item.label}</span>
          <span class='ac-remove-item'>×</span>
        </a>
      </li>"

    # Update preselected items
    if settings.acPreSelectData
      preselectedData = settings.acPreSelectData
    else
      preselectedData = select.find("option:selected")
    if preselectedData.length > 0 && acContainer.find("ul.ac-items-list").length == 0
      acContainer.append("<ul class='ac-items-list'></ul>")
    $(preselectedData).each (index, item) ->
      preselectedItem = {}
      if $(item).is('option')
        preselectedItem['id'] = $(item).val()
        preselectedItem['label'] = $(item).text()
        preselectedItem['image'] = $(item).data('image')
      else
        preselectedItem['id'] = item.id
        preselectedItem['label']= preselectedItem[settings.acLabel] = item[settings.acLabel]
        preselectedItem[settings.acImage] = item[settings.acImage]
      acContainer.find('ul.ac-items-list').append(acSelectedItemHtml(preselectedItem))

    # Update selected items list
    updateSelectedItems = (acContainer, acName, item) ->
      select.find("option[value=#{item.id}]").prop('selected', true)
      console.log select.find("option:selected")
      if acContainer.find("ul.ac-items-list").length == 0
        acContainer.append("<ul class='ac-items-list'></ul>")
      acContainer.find('ul.ac-items-list').append(acSelectedItemHtml(item))

    # Init autocomplete
    acContainer.find(".#{acName}-input").autocomplete(
      delay: 100
      minLength: 0
      source: data[acSelectData]

      close: (event, ui) ->
        if $(@).hasClass "ac-item-selected"
          $(@).val('')
          $(@).removeClass "ac-item-selected"

      select: (event, ui) ->
        $(@).addClass "ac-item-selected"
        updateSelectedItems(acContainer, acName, ui.item)
        # remove selected item from acSelectData
        $(data[acSelectData]).each (index, item) ->
          if item.id == ui.item.id
            data[acSelectData].splice(index, 1)

    ).data("ui-autocomplete")._renderItem = (ul, item) ->
      $(ul).addClass "ac-results ac-#{acName}-results"
      $("<li>").addClass("ac-result-item").
        append("<a>#{if item[settings.acImage] then "<img src=#{item[settings.acImage]}>" else ""}<span>#{item.label}</span></a>").appendTo ul

    # Remove selected item from list
    acContainer.on 'click', ".ac-remove-item", (e) ->
      selectedItem = $(@).closest('li')
      item = {}
      item['id'] = selectedItem.data('id')
      item['label']= item[settings.acLabel] = selectedItem.find('.ac-item-label').text()
      item[settings.acImage] = selectedItem.find('img').attr('src')
      data[acSelectData].push(item)
      data[acSelectData] = sortDataByLabel(data[acSelectData])
      select.find("option[value=#{item.id}]").prop('selected', false)
      console.log select.find("option:selected")
      if selectedItem.siblings().length == 0
        selectedItem.parent().remove()
      else
        selectedItem.remove()

) jQuery
